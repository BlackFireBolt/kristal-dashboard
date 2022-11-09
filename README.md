# Control panel for production line (Minsk-KRISTAL factory)

VueJS + Router + Vuex. The front-end part of the project, the main back-end is written in Python (Flask) by my colleague. Additional backend (authorization system, user activity logging, production line maintenance) was written by me in Python (FastAPI), but it's in private repository.

It can collect information from the server side (from counters) and view it on charts, send tasks and taxes to counters, a log for maintenance.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
