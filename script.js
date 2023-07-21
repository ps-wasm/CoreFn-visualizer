
let coreFnData;
let currentDepth = 0;
let maxDepth = 0;

let margin = { top: 60, right: 20, bottom: 20, left: 20 };
let width = window.innerWidth - margin.right - margin.left;
let height = window.innerHeight - margin.top - margin.bottom;

let recCoreFnElements =
  ["decls"
    , "expression"
    , "body"
    , "abstraction"
    , "argument"
    , "caseAlternatives"
    , "caseExpressions"
    , "binders"
    , "literal"
    , "value"
    , "binds"
  ]


function submit() {
  let elems = document.getElementsByTagName("svg");
  let errorP = document.getElementById("error")
  errorP.innerText = ""

  while (elems.length > 0) {
    elems[0].remove();
  }

  try {
    coreFnData = JSON.parse(document.getElementById("corefn-data").value);
    if (coreFnData.hasOwnProperty("decls")) {
      let root = transformCoreFn("decls", coreFnData['decls']);
      update(root);
    }
    else {
      errorP.innerText = "Not recognized as CoreFn JSON"
    }
  }
  catch (e) {
    errorP.innerText = e
  }
}


function update(source) {
  let i = 0;

  let tree = d3.layout.tree()
    .size([height, width]);

  let diagonal = d3.svg.diagonal()
    .projection(function (d) { return [d.x, d.y]; });

  let svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")


  let nodes = tree.nodes(source).reverse();
  let links = tree.links(nodes);

  nodes.forEach(function (d) { d.y = d.depth * 75; });

  let scale = height / maxRec(source, "y");
  svg.attr("transform", `scale(${scale}) translate(${margin.left}, ${margin.right})`);

  nodes.forEach(function (d) { d.x = 1.8 * d.x / scale });

  let node = svg.selectAll("g.node")
    .data(nodes, function (d) { return d.id || (d.id = ++i); });

  let nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  nodeEnter.append("circle")
    .attr("r", 20)
    .style("fill", "#fff");

  nodeEnter.append("text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function (d) { return d.label })
    .call(wrap)
    .style("fill-opacity", 1);

  // Declare links
  let link = svg.selectAll("path.link")
    .data(links, function (d) { return d.target.id; });

  // Enter links
  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", diagonal);
}



function transformCoreFn(key, coreFn) {
  currentDepth++;
  if (currentDepth > maxDepth) {
    maxDepth = currentDepth;
  }


  let node = { label: key, children: [] };
  if (key === "value") {
    if (coreFn.hasOwnProperty("identifier")) {
      let ns = ""
      if (coreFn.hasOwnProperty("moduleName")) {
        coreFn.moduleName.forEach(element => {
          ns = ns + element + "."
        });
      }
      node.label = ns + coreFn.identifier
    }
    else {
      if (coreFn.hasOwnProperty("literalType")) {
        node.label = coreFn.literalType
        if (!Array.isArray(coreFn.value)) {
          node.label = node.label + ": " + coreFn.value
        }
      }
      else {
        node.label = coreFn.value
      }
    }
  }
  else if (key === "literal") {
    node.label = coreFn.value
  }
  else if (coreFn.hasOwnProperty("type")) {
    if (coreFn.type === "App") {
      node.label = "@"
    }
    else if (coreFn.type === "Abs") {
      node.label = node.label = "\u03BB" + coreFn.argument
    }
    else {
      node.label = coreFn.type
    }
  }
  else if (coreFn.hasOwnProperty("binderType")) {
    node.label = coreFn.binderType
    if (coreFn.hasOwnProperty("identifier")) {
      node.label = node.label + ": " + coreFn.identifier
    }
  }
  else if (coreFn.hasOwnProperty("identifier")) {
    node.label = coreFn.identifier
  }
  else if (!isNaN(key)) {
    node.label = "[" + key + "]"
  }



  for (const property in coreFn) {
    let value = coreFn[property];
    if (typeof (value) === 'object') {
      if (recCoreFnElements.includes(property) || !isNaN(property)) {
        let propertyName = property
        if (!isNaN(propertyName)) {
          propertyName = "[" + propertyName + "]"
        }
        if (Array.isArray(value)) {
          propertyName = propertyName + " \u005B \u005D"
        }
        node.children.push(transformCoreFn(propertyName, value))
      }
    }
    // else if (property === "value") {
    //   node.children.push(transformCoreFn(property, value))
    // }
  }

  currentDepth--;

  return node;
}

function maxRec(object, key) {
  let retVal = 0;
  if (object !== undefined) {
    if (object.hasOwnProperty("children")) {
      retVal = Math.max(object[key], Math.max(...object.children.map(x => maxRec(x, key))));
    }
    else {
      retVal = object[key];
    }
  }

  return retVal;
}

function wrap(text) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split("."),
      lineNumber = 0,
      lineHeight = 1, // ems
      x = text.attr("x"),
      y = text.attr("y"),
      dy = 0

    text.text(null)

    words.forEach(word => {
      text.append("tspan")
        .attr("x", 0)
        .attr("y", -10)
        .attr("dy", ++lineNumber * lineHeight + dy + "em")
        .text(word);
    });
  });
}