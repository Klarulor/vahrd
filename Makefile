run:
	npx ts-node src
build:
	docker build -t 192.168.0.20:5000/vahrd:latest --platform linux/arm64,linux/amd64 .
push:
	docker push 192.168.0.20:5000/vahrd:latest
update:
	make check
	make build
	make push
check:
	tsc -p .