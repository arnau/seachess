AQ_VERSION ?= v0.1.0
AQ ?= aquarium
ARTIFACT_NAME ?= x86_64-unknown-linux-musl_aquarium

production:
	make fetch
	make build
	zola --root website build -o public
.PHONY: production

preview:
	make fetch
	make build
	zola --root website build --base-url ${BASE_URL} -o public
.PHONY: preview

# XXX: [Netlify image](https://github.com/netlify/build-image/) already install graphviz.
fetch:
	curl -L -o ${AQ} https://github.com/arnau/aquarium/releases/download/${AQ_VERSION}/${ARTIFACT_NAME}
	chmod +x ${AQ}
.PHONY: fetch

build:
	RUST_LOG=info ./${AQ} build -i corpus -o website
.PHONY: build
