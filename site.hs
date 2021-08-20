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
import qualified Data.Time as Time
import Data.Time.Locale.Compat (TimeLocale, defaultTimeLocale)
-- control
import Control.Applicative ((<|>))
import Control.Monad (mplus, liftM, liftM2, ap, (>=>))
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

--------------------------------------------------------------------------------

main :: IO ()
main = do
  now <- Time.getCurrentTime

  -- handle urls differently in watch mode
  isPublish <- notElem "watch" <$> getArgs
  let adjustUrls = bool pure removeExt isPublish >=> relativizeUrls
  
  -- compile website
  hakyll $ do

    match "images/**" $ do
        route   idRoute
        compile copyFileCompiler

    match "static/**" $ do
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

    let timeCtx = ctxWithDate now defaultContext

    -- collect all tags found in posts and assign them a url
    -- https://javran.github.io/posts/2014-03-01-add-tags-to-your-hakyll-blog.html
    tags  <- buildTagsWith getTags  postGlob (fromCapture "tags/*.html")
    tools <- buildTagsWith getTools postGlob (fromCapture "tools/*.html")
    let ctx = ctxWithDate now $ postCtxWithTags tags tools

    -- miscellaneous pages with fixed links
    match (fromList ["resources.md"]) $ do
        route   $ setExtension "html"
        compile $ pandocCompiler
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
                >>= loadAndApplyTemplate "templates/default.html" tagCtx
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
    match postGlob $ do
        route $ setExtension "html"
        compile $ do
            -- check file metadata for bib/csl files
            item <- getUnderlying
            cslFile <- fromMaybe "csl/acm-siggraph.csl" <$> getMetadataField item "csl"
            bibFile <- fromMaybe "bib/refs.bib" <$> getMetadataField item "bib"
            -- compile
            getResourceBody
                >>= Bib.pandocBiblioCompilerWith readerOpts cslFile bibFile
                >>= renderMath
                >>= loadAndApplyTemplate "templates/post.html"    ctx
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= adjustUrls

    match projectGlob $ do
        route $ setExtension "html"
        compile $ pandocCompiler
            >>= loadAndApplyTemplate "templates/post.html"    ctx
            >>= loadAndApplyTemplate "templates/default.html" ctx
            >>= adjustUrls

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
                >>= loadAndApplyTemplate "templates/default.html" archiveCtx
                >>= adjustUrls

    create ["projects.html"] $ do
        route idRoute
        compile $ do
            projects <- recentFirst =<< loadAll projectGlob
            let archiveCtx =
                    listField "posts" ctx (return projects) `mappend`
                    constField "title" "Archives"              `mappend`
                    ctx

            makeItem ""
                >>= loadAndApplyTemplate "templates/archive.html" archiveCtx
                >>= loadAndApplyTemplate "templates/default.html" archiveCtx
                >>= adjustUrls


    match "index.html" $ do
        route idRoute
        compile $ do
            posts    <- recentFirst =<< loadAll postGlob
            projects <- recentFirst =<< loadAll projectGlob
            let indexCtx =
                    listField "posts"    ctx (return (take 5 posts)) `mappend`
                    listField "projects" ctx (return projects)       `mappend`
                    ctx

            getResourceBody
                >>= applyAsTemplate indexCtx
                >>= loadAndApplyTemplate "templates/default.html" indexCtx
                >>= adjustUrls

    match "templates/*" $ compile templateBodyCompiler

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
    dateField "date" fmt         `mappend`
    dateField "date_updated" fmt `mappend`
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