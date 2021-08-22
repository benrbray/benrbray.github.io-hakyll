.PHONY: build
build:
	cabal run site -- clean
	cabal run site -- build

.PHONY: watch
watch:
	rm -rf _site
	rm -rf _cache
	cabal run site -- watch
