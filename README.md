# Trans Frame

`Trans Frame` is a Chrome extension that enables translation by capturing images on web pages.

## User Story

As a user watching educational videos or presentations in a foreign language, I want to translate the vocabulary displayed on slides or in the video content into a language I understand better, so I can grasp the material more easily.
[More Info](doc/requirement.md)

## Developer Install

1. clone repository

```sh
git clone https://github.com/chialatte2129/trans-frame-chrome.git
```

2. Open chrome

3. Extensions > Manage Extension

4. Turn on `Developer mode`.
5. click `Load unpacked`
6. select project path
7. You will see `Trans Frame` extension in your extension list

## Build webpack

1. Enter /webpack

```sh
cd webpack
```

2. Init NPM

```sh
npm init -y
```

3. Edit `package.json`

```json
{
  "private": true
}
```

Remove `main` from parameter

4. Install package

```sh
npm install webpack webpack-cli
npm install tesseract.js
```

5. Execute webpack

```sh
npx webpack
```
