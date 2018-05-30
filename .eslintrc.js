module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:vue/recommended"
    ],
    "parserOptions": {
        "sourceType": "module"
    },
    "plugins": [
        "vue"
    ],
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "vue/no-parsing-error": [2, {
            "x-invalid-end-tag": false
        }],
        "vue/max-attributes-per-line": [2, {
            "singleline": 2,
            "multiline": {
                "max": 2,
                "allowFirstLine": true
            }
        }],
    }
};