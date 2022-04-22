install:
	npm ci

build:
	npm run build

serve:
	npx webpack serve

test-coverage:
	npm run test-coverage

lint:
	npx eslint .

fix: 
   npx eslint . --fix

publish:
	npm publish