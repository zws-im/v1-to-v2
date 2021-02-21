# v1-to-v2

Keeps legacy v1 Google Cloud Functions endpoints working with the v2 API.

When I wrote ZWS when I was 15 I made some... poor... engineering decisions.
As a result all the endpoints in v1 were hardcoded to use Google Cloud Functions URLs as well as having very strange parameters.

This replaces the old functions with small wrappers around the v2 API without breaking (much) compatibility with older clients.
However, **it is recommended all ZWS API consumers upgrade to the native v2 endpoints as soon as possible**.
