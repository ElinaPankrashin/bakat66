var typeEstonian = {
  "antonym": "antonüüm",
  "be_in_state": "on seisundis",
  "belongs_to_class": "kuulub klassi",
  "causes": "põhjustab",
  "fuzzynym": "on hägusalt seotud",
  "has_holo_location": "on osa kohast",
  "has_holo_madeof": "on osa materjalist",
  "has_holo_member": "on liige",
  "has_holo_part": "on osa",
  "has_holo_portion": "on annus",
  "has_holonym": "on osa",
  "has_hyperonym": {"verb": "alammõiste", "noun": "alammõiste"},
  "has_hyponym": {"verb": "ülemmõiste", "noun": "ülemmõiste"},
  "has_instance": "esindaja",
  "has_mero_location": "üks osa (kohast) on",
  "has_mero_madeof": "üks osa (materjalist) on",
  "has_mero_member": "liige on",
  "has_mero_part": "osa on",
  "has_mero_portion": "üks annus on",
  "has_meronym": "osa on",
  "has_subevent": "osasündmus on",
  "has_xpos_hyperonym": {"verb": "alammõiste (erinevad sõnaliigid)", "noun": "alammõiste (erinevad sõnaliigid)"},
  "has_xpos_hyponym": {"verb": "ülemmõiste (erinevad sõnaliigid)", "noun": "ülemmõiste (erinevad sõnaliigid)"},
  "involved": "kaasneb",
  "involved_agent": "kaasneb tegija",
  "involved_instrument": "kaasneb vahend",
  "involved_location": "kaasneb koht",
  "involved_patient": "kaasneb tegevusobjekt",
  "involved_target_direction": "kaasneb tegevuse sihtkoht",
  "is_caused_by": "on põhjustatud",
  "is_subevent_of": "on osasündmus",
  "near_antonym": "peaaegu vastand on",
  "near_synonym": "peaaegu samatähenduslik on",
  "role": "mängib rolli",
  "role_agent": "mängib tegijana rolli",
  "role_instrument": "mängib vahendina rolli",
  "role_location": "mängib kohana rolli",
  "role_patient": "mängib tegevusobjektina rolli",
  "role_target_direction": "mängib tegevuse sihtkohana rolli",
  "state_of": "on seisundiks",
  "xpos_fuzzynym": "on hägusalt seotud (erinevate sõnaliikide puhul)",
  "xpos_near_antonym": "peaaegu vastand on (erinevate sõnaliikide puhul)",
  "xpos_near_synonym": "peaaegu samatähenduslik on (erinevate sõnaliikide puhul)",
  "has_derived": "on tuletatud",
  "variants": "sünonüüm",
  "synonym": "sünonüüm"
};

var typeValues = {}

var svg = d3.select("svg"),
  width = document.getElementById("svgGraph").getBoundingClientRect().width,
  height = +svg.attr("height");
var steps = 5;
var step = (height - 300) / (2 * steps);
var hist = [];

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function (d) {
    return d.id;
  }).distance(function (d, i) {
    return 150 + (i % steps) * step
  }))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));

var data = [];
var groups = [];
var nodes = [];
var all_nodes = [];
var links = [];
var curword, cursense, curgraph;
var enabled = undefined;

window.onpopstate = function (event) {
  loadWord(event.state.word, event.state.sense, true);
};

function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function showWordSenses(word) {
  document.getElementById('wordTitle').innerHTML = word;
  document.getElementById('partOfSpeech').innerHTML = '';
  document.getElementById('wordDef').innerHTML = '';
  var lst = "";
  for (var i = 0; i < data[word].length; i++) {
    var sense = data[word].sort(function (a, b) {
      return a.s - b.s;
    })[i];
    lst += '<div class="sense"><span class="senseNr">(' + sense.s + ')</span> <a class="senseDef" href="javascript:loadWord(\'' +
      word + '\', ' + sense.s + ')">' + (sense.d || "Info puudub") + '</a></div>'
  }
  svg.selectAll("*").remove();
  document.getElementById('sensePicker').innerHTML = lst;
}

function getAllTypes(graph) {
  var types = [];
  for (var i = 0; i < graph["links"].length; i++) {
    var l = graph["links"][i];
    if (types.indexOf(getWordType(l.target)) === -1 && getWordType(l.target) != null) {
      types.push(getWordType(l.target));
    }
  }
  return types;
}

function buildLegend(graph) {
  var types = getAllTypes(graph);
  document.getElementById('legend').innerHTML = '';
  if (enabled === undefined) {
    enabled = types;
  }
  if (types.length > 0) {
    document.getElementById('legend').innerHTML += '<label for="toggle-all" class="toggle-all">Vali kõik</label>' +
        '<input type="checkbox" id="toggle-all"' +
        (enabled.length != types.length ? "" : " checked") + ' onclick="toggleAll()"><br>'
  }
  var tobjs = [];
  for (var i = 0; i < types.length; i++) {
    var type = types[i];
    var typestr = type;
    if (typeEstonian[type]) {
      typestr = typeEstonian[type];
      if (typeEstonian[type][graph["part_of_speech"]]) {
        typestr = typeEstonian[type][graph["part_of_speech"]]
      }
    }
    tobjs.push({type: type, str: typestr});
  }
  tobjs.sort(function(a, b) {return (a.str < b.str) ? -1 : (a.str > b.str) ? 1 : 0});
  for (var j = 0; j < tobjs.length; j++) {
    var t = tobjs[j].type;
    var tstr = tobjs[j].str;
    document.getElementById('legend').innerHTML += '<label for="legend-' + t + '" class="type-' + t +
        '">' + tstr + '</label><input type="checkbox" id="legend-' + t + '"' +
        (enabled.indexOf(t) === -1 ? "" : " checked") + ' onclick="toggleEnabled(\'' + t + '\')"><br>'
  }
  document.getElementById('legendTitle').innerHTML = "Legend";
}


function buildHistory() {
  document.getElementById('history').innerHTML = '';
  for (var i = 0; i < hist.length; i++) {
    var h = hist[i];
    document.getElementById('history').innerHTML += '<a href="javascript:loadWord(\'' + h["word"] +
      '\', ' + h["sense"] + ', false, arraysEqual(enabled, getAllTypes(curgraph)))">' + h["word"] + ' (' + h["sense"] + ')' + '</a><br>';
  }
  document.getElementById('historyTitle').innerHTML = "Ajalugu";
}

function toggleAll() {
  var checked = document.getElementById('toggle-all').checked;
  if (checked) {
    enabled = getAllTypes(curgraph);
  } else {
    enabled = [];
  }
  loadWord(curword, cursense, true, false);
}

function toggleEnabled(type) {
  if (document.getElementById('legend-' + type).checked) {
    enabled.push(type);
  } else {
    enabled.splice(enabled.indexOf(type), 1);
  }
  loadWord(curword, cursense, true, false);
}

function decodeWord(word, sense) {
  var raw = data[word].find(function (el) {
    return el.s == sense
  });

  var word_data = {
    'part_of_speech': raw['p'],
    'sense': raw['s'],
    'definition': raw['d'],
    'links': [],
    'nodes': [{'id': word, 'group': 1}]
  };
  for (var i = 0; i < raw['l'].length; i++) {
    var link = raw['l'][i];
    var sp = link.split('|');
    var l = {
      'target': sp[2],
      'source': word,
      'value': typeValues[groups[sp[0] - 2]] || 1,
      'type': groups[sp[0] - 2]
    };
    var n = {
      'id': sp[2],
      'group': sp[0],
      'type': groups[sp[0] - 2],
      'sense': sp[1]
    };
    word_data['links'].push(l);
    word_data['nodes'].push(n);
  }
  return word_data;
}

function loadWord(word, sense, dontPush, resetEnabled) {
  var enChanged = enabled === undefined || enabled.sort() == getAllTypes(curgraph).sort();
  curword = undefined;
  cursense = undefined;
  word = word.toLowerCase();
  if (data == undefined || !data[word]) {
    document.getElementById('sensePicker').innerHTML = '';
    document.getElementById('wordTitle').innerHTML = '';
    document.getElementById('partOfSpeech').innerHTML = '';
    document.getElementById('wordDef').innerHTML = 'Sõna ei leitud';
    return;
  }
  if (!sense) {
    if (data[word].length == 1) {
      sense = data[word][0].s;
    } else {
      document.getElementById('legend').innerHTML = '';
      document.getElementById('legendTitle').innerHTML = '';
      showWordSenses(word);
      if (!dontPush) window.history.pushState({word: word}, "", "?word=" + encodeURIComponent(word));
      return;
    }
  }
  if (hist.filter(function (x) {
      return x.word == word && x.sense == sense
    }).length == 0)
    hist.push({word: word, sense: sense});
  buildHistory();
  if (!dontPush)
    window.history.pushState({
      word: word,
      sense: sense
    }, "", "?word=" + encodeURIComponent(word) + "&sense=" + sense);
  svg.selectAll("*").remove();
  var graph = decodeWord(word, sense);
  if (!graph) return;
  if (resetEnabled) enabled = undefined;
  document.getElementById('sensePicker').innerHTML = '';
  document.getElementById('wordTitle').innerHTML = word;
  document.getElementById('partOfSpeech').innerHTML = "(" + graph.part_of_speech + ")" || "Hetkel info puudub";
  document.getElementById('wordDef').innerHTML = graph.definition || "Hetkel info puudub";
  all_nodes = graph.nodes;
  var gnodes = graph.nodes.filter(function (x) {
    return enabled === undefined || enabled.indexOf(x.type) !== -1 || !x.type
  });
  var glinks = graph.links.filter(function (x) {
    return enabled === undefined || enabled.indexOf(x.type) !== -1 || !x.type
  });
  nodes = [];
  links = [];
  curword = word;
  cursense = sense;
  for (var i = 0; i < gnodes.length; i++) {
    var obj = gnodes[i];
    var ifExists = false;
    for (var j = 0; j < nodes.length; j++) {
      var node2 = nodes[j];
      if (obj.id == node2.id) {
        ifExists = true;
        break
      }
    }
    if (ifExists == false) nodes.push(obj);
  }

  for (var k = 0; k < glinks.length; k++) {
    var obj3 = glinks[k];
    var ifExists2 = false;
    for (var l = 0; l < links.length; l++) {
      var link2 = links[l];
      if (obj3.target == link2.target) {
        ifExists2 = true;
        break;
      }
    }
    if (ifExists2 == false) links.push(obj3);
  }
  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", function (d) {
      return "type-" + getWordType(d.target)
    })
    .attr("stroke-width", function (d) {
      return 0.5 + Math.sqrt(d.value);
    });

  var nodeEnter = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter();

  var node = nodeEnter.append("g");

  /*var circle = node.append("circle")
   .attr("r", function(d) {return 10})
   .attr("fill", function(d) { return color(d.group); })
   .call(d3.drag()
   .on("start", dragstarted)
   .on("drag", dragged)
   .on("end", dragended));*/

  var text = node.append("text")
      .attr("text-anchor", "middle")
      .attr("class", function(d) {
        return d.group == 1 && "middle-word" || "linked-word";
      })
      .text(function (d) {
        return d.id;
      })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on("dblclick", function (d) {
      loadWord(d.id, d.sense, false, arraysEqual(enabled, getAllTypes(curgraph)));
    });

  simulation
    .nodes(nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(links);

  function ticked() {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    /*circle
     .attr("cx", function(d) { return d.x; })
     .attr("cy", function(d) { return d.y; });*/

    text.attr("x", function (d) {
      return d.x
    })
      .attr("y", function (d) {
        return d.y
      })
  }

  simulation.alphaTarget(0.3).restart();
  buildLegend(graph);
  curgraph = graph;
}

d3.json("dictionary.txt", function (error, graph) {
  if (error) throw error;
  data = graph.data;
  groups = graph.groups;
  var initial = getParameterByName("word");
  var initialDef = getParameterByName("sense");
  document.getElementById("loading").remove();
  if (initial) {
    loadWord(initial, initialDef);
    document.getElementById('word').value = initial;
  }
});

function getWordType(word) {
  if (typeof word === 'object') {
    return word.type;
  }
  for (var i = 0; i < all_nodes.length; i++) {
    var n = all_nodes[i];
    if (n.id == word) return n.type;
  }
  return null;
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  a.sort();
  b.sort();

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}