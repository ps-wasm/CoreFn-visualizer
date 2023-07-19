
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
    /*,"argument"*/
    , "caseAlternatives"
    , "caseExpressions"
    , "binders"
    , "literal"
    , "value"
    , "binds"
  ]


function submit() {
  let elems = document.getElementsByTagName("svg");
  while (elems.length > 0) {
    elems[0].remove();
  }


  //elems.forEach(x=>x.remove());
  coreFnData = JSON.parse(document.getElementById("corefn-data").value);
  //console.log(coreFnData);

  let root = transformCoreFn("decls", coreFnData['decls'][2]);
  //for (const decl in root.children) {
  //  update(decl);
  //}
  update(root);
  console.log(coreFnData);
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

  // Compute the new tree layout.
  let nodes = tree.nodes(source).reverse();
  let links = tree.links(nodes);

  nodes.forEach(function (d) { d.y = d.depth * 75; });

  let scale = height / maxRec(source, "y");
  svg.attr("transform", `scale(${scale}) translate(${margin.left}, ${margin.right})`);

  // Normalize for fixed-depth.
  nodes.forEach(function (d) { d.x = d.x / scale });

  // Declare the nodes…
  let node = svg.selectAll("g.node")
    .data(nodes, function (d) { return d.id || (d.id = ++i); });

  // Enter the nodes.
  let nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  nodeEnter.append("circle")
    .attr("r", 20)
    .style("fill", "#fff");

  nodeEnter.append("text")
    /*
    .attr("y", function (d) {
      return d.children || d._children ? -20 : 20;
    })
    */
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function (d) {
      return d.label
      // if (d.type === 'Abs') {
      //   return "\u03BB" + d.argument
      // }
      // else if (d.type === 'App') {
      //   return '@'
      // }
      // /*
      // else if (d.type === 'Var') {
      //   let ident = d.children.identifier
      //   let module = ""
      //   if (d.children.hasOwnProperty("moduleName")) {
      //     d.children.moduleName.forEach(element => {
      //       module = module + element + "."
      //     });
      //   }
      //   return module + ident
      // }
      // */
      // else if (d.type !== undefined) {
      //   return d.type;
      // }
      // else if (d.value !== undefined) {
      //   return d.value;
      // }
      // else if (d.hasOwnProperty("binderType")) {
      //   return d.binderType
      // }
      // else {
      //   if (d.hasOwnProperty("identifier")) {
      //     let ident = d.identifier
      //     let module = ""
      //     // if (d.hasOwnProperty("moduleName")) {
      //     //   d.moduleName.forEach(element => {
      //     //     module = module + element + "."
      //     //   });
      //     // }
      //     return module + ident
      //   }
      //   else {
      //     return "[ ]"
      //   }

      // }
    })
    .style("fill-opacity", 1);

  // Declare the links…
  let link = svg.selectAll("path.link")
    .data(links, function (d) { return d.target.id; });

  // Enter the links.
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
  if (coreFn.hasOwnProperty("type")) {
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
  if (coreFn.hasOwnProperty("identifier")) {
    if (key === "value") {
      let ns = ""
      if (coreFn.hasOwnProperty("moduleName")) {
        coreFn.moduleName.forEach(element => {
          ns = ns + element + "."
        });
        //ns = ns + "\n"
      }
      node.label = ns + coreFn.identifier
    }
    node.label = coreFn.identifier
  }



  for (const property in coreFn) {
    let value = coreFn[property];
    if (typeof (value) === 'object') {
      if (recCoreFnElements.includes(property) || Array.isArray()) {
        node.children.push(transformCoreFn(property, value))
      }
    }


  }




  //console.log(property);
  /*
      if (!["annotation", "sourcePos", "moduleName"].includes(property)) {
        if (value.hasOwnProperty("type")) {
          let type = value.type
          if (type === "App") {
            node.label = "@"
          }
          else if (type === "Abs") {
            let arg = value.argument
            node.label = "\u03BB" + arg
          }
          else {
            node.label = type
          }
        }
        else {
          if ()
          node.label = property
        }
        if (typeof (value) === 'object') {
          node.children = []
          node.children.push(transformCoreFn(value))
        }
      }
    }
    /*
        if (typeof (value) === 'object') {
          if (property === "annotation" || property === "sourcePos" || property === "moduleName") {
            //console.log("skip property")
          }
          else if (property === "value") {
            let ns = ""
    
            if (value.hasOwnProperty("moduleName")) {
              value.moduleName.forEach(element => {
                ns = ns + element + "."
              });
              ns = ns + "\n"
            }
    
            value.identifier = ns + value.identifier
            
            if (!node.hasOwnProperty('children')) {
              node['children'] = [];
            }
            node['children'].push(transformCoreFn(value));
            
            
            // let tObj = {};
            // tObj[property] = ident
            // Object.assign(node, tObj);
          }
          else {
            if (!node.hasOwnProperty('children')) {
              node['children'] = [];
            }
            node['children'].push(transformCoreFn(value));
          }
        }
        else {
          let tObj = {};
          tObj[property] = value;
          Object.assign(node, tObj);
        }
      }*/
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


/*

        if (d.hasOwnProperty("identifier")) {
          let ident = d.identifier
          let parts = ident.split(".")
          return ident
        }
        else {
          return "[ ]"
        }

        */