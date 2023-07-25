# CoreFn visualizer
This is a limited CoreFn declaration visualizer. It is meant to help reasoning about CoreFn structures in the research for my bachelor's thesis.


### Known limitations
- Only declarations are included in the graph. Other information, like exports, imports, foreign functions etc. are omitted.
- Not all information from declarations is visualized, like annotations and guards.
- Arrays and array elements are visualized in a rudimentary way.
- The graph resolution is limited to the window size. Therefore only a limited number of declarations and / or a limited tree depth is supported.
- Error handling is very basic.


### Acknowledgements
- I used the example found [here](https://codepen.io/katzkode/pen/ZegQQB) code to start building a vertical tree D3 tree.
- I used the example found [here](https://gist.github.com/mbostock/7555321) to create my own `wrap` function that wraps the labels of namespaced identifiers.
