module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    // https://github.com/vuejs/vetur/blob/master/docs/linting-error.md#linting-for-template
    // https://github.com/vuejs/vue-cli/issues/970
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
            2,
            { "SwitchCase": 1 }
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
        "vue/attributes-order": ["off"],
    }
};