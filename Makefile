.PHONY: build
build:
	cabal run site -- clean
	cabal run site -- build

.PHONY: watch
watch:
	cabal run site -- clean
	cabal run site -- watch
