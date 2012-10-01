MOCHA_OPTS = --require should --compilers coffee:coffee-script --colors
REPORTER = dot

test: test-unit

test-unit:
	@NODE_ENV=test clear && ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

test-cov: lib-cov
	@SRCDSTOOLS_COV=1 ./node_modules/.bin/mocha \
		--reporter html-cov \
		$(MOCHA_OPTS) > coverage.html
	@rm -r lib-cov

lib-cov:
	@./node_modules/visionmedia-jscoverage/jscoverage lib lib-cov

.PHONY: test test-unit
