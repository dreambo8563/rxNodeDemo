# rxNodeDemo

Just a simple http server migrate with rx

- http request 
- log errors 
- parser with param /main/:id 
- parser with queryString /main/:id?name=vincent 
- set publicDirectory 
- render static html - static router and router match
- log errors into file
- helper.ObservableObject function(obj/array)

vs code settings:

```json
{
    "files.exclude": {
        "**/.git": true,
        "**/.DS_Store": true,
        "**/*.map": true,
        "**/*.js": {
            "when": "$(basename).ts"
        }
    },
    "javascript.validate.enable": false,
    "eslint.enable": true,
    "files.associations": {
        "*.js": "javascriptreact"
    }
}
```
