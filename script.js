
var coreFnData;
var currentDepth = 0;
var maxDepth = 0;

var margin = { top: 60, right: 20, bottom: 20, left: 20 };
var width = window.innerWidth - margin.right - margin.left;
var height = window.innerHeight - margin.top - margin.bottom;



function submit() {
  var elems = document.getElementsByTagName("svg");
  while (elems.length > 0) {
    elems[0].remove();
  }

  
  //elems.forEach(x=>x.remove());
  coreFnData = JSON.parse(document.getElementById("corefn-data").value);
  

  root = transformCoreFn(coreFnData['decls']);
  for (const decl in root.children) {
    update(decl);
  }
  //update(root);

}




function update(source) {
  var i = 0;

var tree = d3.layout.tree()
    .size([height, width]);

  var diagonal = d3.svg.diagonal()
    .projection(function (d) { return [d.x, d.y]; });

  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")

  // Compute the new tree layout.
  var nodes = tree.nodes(source).reverse();
  var links = tree.links(nodes);

  nodes.forEach(function (d) { d.y = d.depth * 75; });

  var scale = height / maxRec(source, "y");
  svg.attr("transform", `scale(${scale}) translate(${margin.left}, ${margin.right})`);

  // Normalize for fixed-depth.
  nodes.forEach(function (d) { d.x = d.x / scale });

  // Declare the nodes…
  var node = svg.selectAll("g.node")
    .data(nodes, function (d) { return d.id || (d.id = ++i); });

  // Enter the nodes.
  var nodeEnter = node.enter().append("g")
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
      if (d.type === 'Abs') {
        return "\u03BB" + d.argument
      }
      else if (d.type === 'App') {
        return '@'
      }
      else if (d.type !== undefined) {
        return d.type;
      }
      else if (d.value !== undefined) {
        return d.value;
      }
      else {
        return d.identifier;
      }
    })
    .style("fill-opacity", 1);

  // Declare the links…
  var link = svg.selectAll("path.link")
    .data(links, function (d) { return d.target.id; });

  // Enter the links.
  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", diagonal);

}



function transformCoreFn(coreFn) {
  currentDepth++;
  if (currentDepth > maxDepth) {
    maxDepth = currentDepth;
  }

  var node = {};
  for (const property in coreFn) {
    let value = coreFn[property];
    //console.log(property);
    if (typeof (value) === 'object') {
      if (property === "annotation" || property === "sourcePos" || property === "moduleName") {
        //console.log("skip property")
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
  }
  currentDepth--;

  return node;
}

function maxRec(object, key) {
  var retVal = 0;
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
