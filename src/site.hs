--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}
import           Data.Monoid (mappend)

-- system
import System.Environment
-- pandoc
import Text.Pandoc
import qualified Text.Pandoc.Extensions as TPE
import qualified Text.Pandoc.Options as TPO
-- hakyll
import Hakyll hiding (Template)
-- blaze
import Text.Blaze.Html ( toHtml, toValue, Html, (!))
import qualified Text.Blaze.Html5              as H
import qualified Text.Blaze.Html5.Attributes   as A
-- data
import Data.Bool (bool)
import Data.Maybe (fromMaybe)
import Data.List (intersperse, sortBy, elem, isSuffixOf)
import Data.List.Extra (stripSuffix)
import Data.Functor.Identity
import Data.Functor ((<&>))
-- control
import Control.Applicative ((<|>))
import Control.Monad (mplus, msum, liftM, liftM2, ap, (>=>), when, guard, unless)
-- time
import Data.Time.Clock (UTCTime (..))
import Data.Time.Format (formatTime, parseTimeM)
import qualified Data.Time as Time
import Data.Time.Locale.Compat (TimeLocale, defaultTimeLocale)
-- text
import qualified Data.Text as T
import Data.Text (Text)
-- debug
import Debug.Trace (trace, traceShow)

-- project imports
import KaTeX (kaTeXifyIO)
import qualified Biblio as Bib


--------------------------------------------------------------------------------

-- reusable globs, to prevent typos

postGlob :: Pattern
postGlob = "posts/**"

projectGlob :: Pattern
projectGlob = "projects/**"

postDraftGlob :: Pattern
postDraftGlob = "unpublished/posts/**"

projDraftGlob :: Pattern
projDraftGlob = "unpublished/projects/**"

--------------------------------------------------------------------------------

main :: IO ()
main = do
  now <- Time.getCurrentTime

  -- handle urls differently in watch mode
  isPublish <- notElem "watch" <$> getArgs
  let adjustUrls = bool pure removeExt isPublish >=> relativizeUrls

  -- hakyll configuration
  let config = defaultConfiguration {
                 destinationDirectory = if isPublish then "docs" else "_site"
               }
  
  -- compile website
  hakyllWith config $ do

    match "images/**" $ do
        route   idRoute
        compile copyFileCompiler

    match "static/**" $ do
        route   idRoute
        compile copyFileCompiler
    
    match "CNAME" $ do
        route   idRoute
        compile copyFileCompiler

    match "css/*" $ do
        route   idRoute
        compile compressCssCompiler

    -- bibliography
    match "bib/**" $ compile Bib.biblioCompiler
    match "csl/**" $ compile Bib.cslCompiler

    -- static katex assets
    match "katex/**" $ do
        route idRoute
        compile copyFileCompiler

    -- collect all tags found in posts and assign them a url
    -- https://javran.github.io/posts/2014-03-01-add-tags-to-your-hakyll-blog.html
    tags  <- buildTagsWith getTags  (postGlob .||. projectGlob) (fromCapture "tags/*.html")
    tools <- buildTagsWith getTools (projectGlob .||. postGlob) (fromCapture "tools/*.html")
    let ctx = ctxWithDate now $ postCtxWithTags tags tools

    -- miscellaneous pages with fixed links
    match (fromList ["resources.md"]) $ do
        route   $ setExtension "html"
        compile $ pandocCompiler
            >>= loadAndApplyTemplate "templates/page.html"    ctx
            >>= loadAndApplyTemplate "templates/default.html" ctx
            >>= adjustUrls

    -- give each tag its own page
    tagsRules tags $ \tag pattern -> do
        let title = "Posts tagged \"" ++ tag ++ "\""
        route idRoute
        compile $ do
            posts <- recentFirst =<< loadAll pattern
            let tagCtx = constField "title" title
                      `mappend` listField "posts" ctx (return posts)
                      `mappend` ctx

            makeItem ""
                >>= loadAndApplyTemplate "templates/tag.html" tagCtx
                >>= loadAndApplyTemplate "templates/page.html"    ctx
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= adjustUrls

    -- give each tag its own page
    tagsRules tools $ \tag pattern -> do
        let title = "Posts tagged \"" ++ tag ++ "\""
        route idRoute
        compile $ do
            posts <- recentFirst =<< loadAll pattern
            let tagCtx = constField "title" title
                      `mappend` listField "posts" ctx (return posts)
                      `mappend` ctx

            makeItem ""
                >>= loadAndApplyTemplate "templates/tag.html" tagCtx
                >>= loadAndApplyTemplate "templates/default.html" tagCtx
                >>= adjustUrls

    -- posts

    let postCompiler = renderMath
                   >=> saveSnapshot "postContent" -- for rss feeds
                   >=> loadAndApplyTemplate "templates/post.html"    ctx
                   >=> loadAndApplyTemplate "templates/default.html" ctx
                   >=> adjustUrls

    let postRules = do
          route $ setExtension "html"
          compile $ do
              -- check file metadata for bib/csl files
              item <- getUnderlying
              cslFile <- fromMaybe "csl/acm-siggraph.csl" <$> getMetadataField item "csl"
              bibFile <- fromMaybe "bib/refs.bib" <$> getMetadataField item "bib"
              -- compile
              getResourceBody
                  >>= Bib.pandocBiblioCompilerWith readerOpts cslFile bibFile
                  >>= postCompiler

    match postGlob postRules
    unless isPublish $ match postDraftGlob postRules

    -- projects

    let projCompiler = renderMath
                   >=> loadAndApplyTemplate "templates/post.html"    ctx
                   >=> loadAndApplyTemplate "templates/default.html" ctx
                   >=> adjustUrls

    match projectGlob $ do
        route $ setExtension "html"
        compile $ getResourceBody
                    >>= readPandocWith readerOpts
                    >>= projCompiler

    unless isPublish $ match projDraftGlob $ do
        route $ setExtension "html"
        compile $ getResourceBody 
                    >>= readPandocWith readerOpts
                    >>= projCompiler

    -- static pages

    create ["blog.html"] $ do
        route idRoute
        compile $ do
            posts <- recentFirst =<< loadAll postGlob
            let archiveCtx =
                    listField "posts" ctx (return posts) `mappend`
                    constField "title" "Archives"        `mappend`
                    ctx

            makeItem ""
                >>= loadAndApplyTemplate "templates/archive.html" archiveCtx
                >>= loadAndApplyTemplate "templates/page.html"    archiveCtx
                >>= loadAndApplyTemplate "templates/default.html" archiveCtx
                >>= adjustUrls

    create ["resume.html"] $ do
        route idRoute
        compile $ do
            makeItem ""
                >>= loadAndApplyTemplate "templates/resume.html" ctx
                >>= adjustUrls


    create ["projects.html"] $ do
        route idRoute
        compile $ do
            projects <- recentFirst =<< loadAll projectGlob
            let archiveCtx =
                    listField "posts" ctx (return projects) `mappend`
                    constField "title" "Blog"           `mappend`
                    ctx

            makeItem ""
                >>= loadAndApplyTemplate "templates/archive.html" archiveCtx
                >>= loadAndApplyTemplate "templates/page.html"    archiveCtx
                >>= loadAndApplyTemplate "templates/default.html" archiveCtx
                >>= adjustUrls

    match "index.html" $ do
        route idRoute
        compile $ do
            posts         <- recentFirst =<< loadAll postGlob
            projects      <- recentFirst =<< loadAll projectGlob
            draftPosts    <- recentFirst =<< loadAll postDraftGlob
            draftProjects <- recentFirst =<< loadAll projDraftGlob

            let draftCtx =
                    listField "draftPosts"    ctx (return draftPosts) `mappend`
                    listField "draftProjects" ctx (return draftProjects)

            let pubCtx =
                    listField "posts"         ctx (return (take 5 posts)) `mappend`
                    listField "projects"      ctx (return projects)

            let indexCtx = (if isPublish then pubCtx
                            else draftCtx `mappend` pubCtx)       `mappend`
                            ctx

            getResourceBody
                >>= applyAsTemplate indexCtx
                >>= loadAndApplyTemplate "templates/page.html"    ctx
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= adjustUrls

    match "templates/*" $ compile templateBodyCompiler

    -- feeds
    -- https://jaspervdj.be/hakyll/tutorials/05-snapshots-feeds.html
    create ["atom.xml"] $ do
        route idRoute
        compile $ do
            let feedCtx = ctx `mappend` bodyField "description"
            posts <- fmap (take 10) . recentFirst =<< loadAllSnapshots postGlob "postContent"
            renderAtom feedConfig feedCtx posts


--------------------------------------------------------------------------------

-- rss feed
feedConfig :: FeedConfiguration
feedConfig = FeedConfiguration
    { feedTitle = "Benjamin R. Bray / Blog"
    , feedDescription = "Math & Programming Blog"
    , feedAuthorName = "Benjamin R. Bray"
    , feedAuthorEmail = "benrbray@gmail.com"
    , feedRoot = "https://benrbray.com"
    }

--------------------------------------------------------------------------------

if' :: Bool -> a -> a -> a
if' b x y = if b then x else y 

--------------------------------------------------------------------------------

withInternalUrls :: (String -> String) -> String -> String
withInternalUrls f = withUrls h
    where h :: String -> String
          h = ap (liftM2 if' isExternal id) f

-- | Strip ".html" extension from all internal links.  Useful when
-- publishing to GitHub Pages, which redirects extensionless urls.
removeExt :: Item String -> Compiler (Item String)
removeExt item = do
    route <- getRoute $ itemIdentifier item
    return $ case route of
        Nothing -> item
        Just r  -> fmap (withInternalUrls f) item
    where
        f = ap fromMaybe (stripSuffix ".html")

--------------------------------------------------------------------------------

postCtx :: Context String
postCtx =
    dateField "date" fmt             `mappend`
    metaDateField "date_updated" fmt `mappend`
    defaultContext
    where fmt = "%B %e, %Y"

ctxWithDate :: Time.UTCTime -> Context String -> Context String
ctxWithDate time ctx =
    constField "date_generated" (Time.formatTime defaultTimeLocale "%B %e, %Y" time) 
    `mappend` ctx

---- KATEX MATH ----------------------------------------------------------------

-- | Renders all math equations in a Pandoc document using KaTeX.
-- modified from https://ifazk.com/blog/2018-11-20-JavaScript-free-Hakyll-site.html
renderMath :: Item Pandoc -> Compiler (Item String)
renderMath pandoc = do
  id     <- getUnderlying
  s      <- getMetadataField id "nokatex"
  macros <- fmap T.pack <$> getMetadataField id "katex_macros"
  case s of
    Just _  -> pandocCompilerWith readerOpts writerOpts -- todo: this is wrong
    Nothing -> writePandocWith writerOpts <$> (traverse renderKatex pandoc)
                   where renderKatex = unsafeCompiler . kaTeXifyIO macros

---- DATES ---------------------------------------------------------------------

-- | Looks for a date in the metadata corresponding to the key,
-- and re-format it to have the specified format. 
metaDateField :: String     -- ^ Key in which the rendered date should be placed
              -> String     -- ^ Format to use on the date
              -> Context a  -- ^ Resulting context
metaDateField = metaDateFieldWith defaultTimeLocale

-- https://hackage.haskell.org/package/hakyll-4.14.0.0/docs/src/Hakyll.Web.Template.Context.html#dateFieldWith
metaDateFieldWith :: TimeLocale  -- ^ Output time locale
              -> String      -- ^ Destination key
              -> String      -- ^ Format to use on the date
              -> Context a   -- ^ Resulting context
metaDateFieldWith locale key format = field key $ \i -> do
    time <- getTimeMeta locale key $ itemIdentifier i
    case time of
        Nothing -> noResult "no metadata field 'date_updated'"
        Just t  -> return $ formatTime locale format t

-- | Parser for extracting and parsing a date from the specified metadata key.
-- https://hackage.haskell.org/package/hakyll-4.14.0.0/docs/src/Hakyll.Web.Template.Context.html#getItemUTC
getTimeMeta :: (MonadMetadata m, MonadFail m)
           => TimeLocale        -- ^ Output time locale
           -> String            -- ^ Key
           -> Identifier        -- ^ Input page
           -> m (Maybe UTCTime) -- ^ Parsed UTCTime
getTimeMeta locale key ident = do
    metadata <- getMetadata ident
    let tryField k fmt = lookupString k metadata >>= parseTime' fmt

    return $ msum $
        [tryField key fmt | fmt <- formats]
  where
    parseTime' = parseTimeM True locale
    formats    =
        [ "%a, %d %b %Y %H:%M:%S %Z"
        , "%a, %d %b %Y %H:%M:%S"
        , "%Y-%m-%dT%H:%M:%S%Z"
        , "%Y-%m-%dT%H:%M:%S"
        , "%Y-%m-%d %H:%M:%S%Z"
        , "%Y-%m-%d %H:%M:%S"
        , "%Y-%m-%d"
        , "%B %e, %Y %l:%M %p"
        , "%B %e, %Y"
        , "%b %d, %Y"
        ]


---- PANDOC OPTIONS ------------------------------------------------------------

-- pandoc reader options
readerOpts :: TPO.ReaderOptions
readerOpts = defaultHakyllReaderOptions {
        TPO.readerExtensions = ext
    }
    where ext = TPE.disableExtension TPE.Ext_smart $
                TPO.readerExtensions defaultHakyllReaderOptions
             <> TPE.extensionsFromList [ TPE.Ext_fenced_divs, TPE.Ext_citations ]

-- pandoc writer options
writerOpts :: TPO.WriterOptions
writerOpts = defaultHakyllWriterOptions
    { TPO.writerTableOfContents = True
    , TPO.writerTOCDepth        = 3
    , TPO.writerTemplate        = Just tocTemplate
    , TPO.writerExtensions      = ext
    }
    where ext = TPE.disableExtension TPE.Ext_smart $
                TPO.writerExtensions defaultHakyllWriterOptions
             <> TPE.extensionsFromList [ TPE.Ext_fenced_divs, TPE.Ext_citations ]

-- https://svejcar.dev/posts/2019/11/27/table-of-contents-in-hakyll/
tocTemplate :: Template Text
tocTemplate = either error id . runIdentity . compileTemplate "" $ T.unlines
  [ "<div class=\"toc\"><h2>Table of Contents</h2>"
  , "$toc$"
  , "</div>"
  , "$body$"
  ]

---- TAGS ----------------------------------------------------------------------

-- | add "tags" and "tools" fields to the context
postCtxWithTags :: Tags -> Tags -> Context String
postCtxWithTags tags tools =
  tagsFieldWith getTags  (renderLink "tag")  concatTags "tags"  tags  `mappend`
  tagsFieldWith getTools (renderLink "tool") concatTags "tools" tools `mappend`
  postCtx
    where
      concatTags = mconcat . intersperse " "

-- | Obtain tags from a page in the default way: parse them from the @tags@
-- metadata field. This can either be a list or a comma-separated string.
-- https://hackage.haskell.org/package/hakyll-4.14.0.0/docs/src/Hakyll.Web.Tags.html#getTags
getTools :: MonadMetadata m => Identifier -> m [String]
getTools identifier = do
  metadata <- getMetadata identifier
  let single = lookupStringList "tools" metadata
  let multi  = map trim . splitAll "," <$> lookupString "tools" metadata
  return $ fromMaybe [] $ single <|> multi

renderLink :: H.AttributeValue -> String -> Maybe FilePath -> Maybe H.Html
renderLink _ _ Nothing = Nothing
renderLink cls tag (Just filePath) =
  Just $ H.a
    ! A.href (toValue $ toUrl filePath)
    ! A.class_ cls
    $ toHtml tag