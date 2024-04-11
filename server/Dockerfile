FROM golang AS builder
RUN mkdir /project
WORKDIR /project

COPY go.mod go.sum ./
RUN go mod download
COPY utils utils
COPY main.go ./

RUN CGO_ENABLED=0 go build main.go

FROM alpine
WORKDIR /
COPY --from=builder /project/main /main

CMD [ "/main" ]