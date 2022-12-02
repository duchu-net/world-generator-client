import * as THREE from 'three'
import {
  slerp,
  hashString,
  adjustRange,
  XorShift128,
  SteppedAction,
  randomUnitVector,
  calculateTriangleArea
} from './utils'
import { Tile, Corner, Border } from './objects'

class PlanetSurfaceGenerator {
  planet = {}
  generationSettings = {
    // subdivisions: 20, //detail_level
    subdivisions: 5, //detail_level
    distortionLevel: 100, // CONST?? --- |
    plateCount: 7,
    oceanicRate: 70 / 100,
    heatLevel: 1 / 100 + 1,
    moistureLevel: 1 / 100 + 1,
    seed: 'xyz',
    type: 'earth'
  }
  projectionRenderMode = 'globe'
  surfaceRenderMode = 'terrain'
  renderSunlight = true
  renderPlateBoundaries = false
  renderPlateMovements = false
  renderAirCurrents = false

  activeAction = null
  tileSelection = null
  sunTimeOffset = 0

  constructor(props = {}) {
    this.planetData = props.planetData //generation data
    // this.generationSettings.subdivisions = this.planetData.detail_level;
    // this.generationSettings.distortionLevel = this.planetData.distortion_level;
    // this.generationSettings.plateCount = this.planetData.plate_count;
    // this.generationSettings.oceanicRate = this.planetData.oceanic_rate / 100;
    // this.generationSettings.heatLevel = this.planetData.heat_level / 100 + 1;
    // this.generationSettings.moistureLevel = this.planetData.moisture_level / 100 + 1;
  }

  //##########################################################################
  generatePlanetAsynchronous() {
    console.log('generatePlanetAsynchronous')
    const { generationSettings } = this
    const { subdivisions } = generationSettings

    let planet = null

    let distortionRate = null
    if (generationSettings.distortionLevel < 0.25)
      distortionRate = adjustRange(
        generationSettings.distortionLevel,
        0.0,
        0.25,
        0.0,
        0.04
      )
    else if (generationSettings.distortionLevel < 0.5)
      distortionRate = adjustRange(
        generationSettings.distortionLevel,
        0.25,
        0.5,
        0.04,
        0.05
      )
    else if (generationSettings.distortionLevel < 0.75)
      distortionRate = adjustRange(
        generationSettings.distortionLevel,
        0.5,
        0.75,
        0.05,
        0.075
      )
    else
      distortionRate = adjustRange(
        generationSettings.distortionLevel,
        0.75,
        1.0,
        0.075,
        0.15
      )

    const originalSeed = generationSettings.seed
    let seed = null
    if (typeof originalSeed === 'number') seed = originalSeed
    else if (typeof originalSeed === 'string') seed = hashString(originalSeed)
    else seed = Date.now()
    const random = new XorShift128(seed)

    const plateCount = generationSettings.plateCount
    const oceanicRate = generationSettings.oceanicRate
    const heatLevel = generationSettings.heatLevel
    const moistureLevel = generationSettings.moistureLevel

    return new Promise((resolve, reject) => {
      this.activeAction = new SteppedAction((action) => {
        // console.log('Planet3DGenerator_action', action)  /*updateProgressUI*/
      })
        .executeSubaction((action) => {
          //ui.progressPanel.show()
        }, 0)
        .executeSubaction(
          (action) => {
            this.generatePlanet(
              subdivisions,
              distortionRate,
              plateCount,
              oceanicRate,
              heatLevel,
              moistureLevel,
              random,
              action
            )
          },
          1,
          'Generating Planet'
        )
        .getResult((result) => {
          console.log(
            'PlanetSurfaceGenerator.generatePlanetAsynchronous:result',
            result
          )
          planet = result
          planet.seed = seed
          planet.originalSeed = originalSeed
        })
        .executeSubaction((action) => {
          // this.displayPlanet(planet)
          // this.setSeed(null)
        }, 0)
        .finalize((action) => {
          console.warn('FINISH!!! :D')
          this.activeAction = null
          //ui.progressPanel.hide()
          resolve(planet)
        }, 0)
        .execute()
    })
  }

  generatePlanet(
    icosahedronSubdivision,
    topologyDistortionRate,
    plateCount,
    oceanicRate,
    heatLevel,
    moistureLevel,
    random,
    action
  ) {
    const { planet } = this //new Planet();
    let mesh
    action
      .executeSubaction(
        (action) => {
          this.generatePlanetMesh(
            icosahedronSubdivision,
            topologyDistortionRate,
            random,
            action
          )
        },
        6,
        'Generating Mesh'
      )
      .getResult((result) => {
        planet.mesh = result
        console.log('mesh', mesh)
      })
      .executeSubaction(
        (action) => {
          this.generatePlanetTopology(planet.mesh, action)
        },
        1,
        'Generating Topology'
      )
      .getResult((result) => {
        planet.topology = result
      })
      .executeSubaction(
        (action) => {
          // this.generatePlanetPartition(planet.topology.tiles, action);
        },
        1,
        'Generating Spatial Partitions'
      )
      .getResult((result) => {
        // console.log("planet.partition", result);
        // planet.partition = result;
      })
      .executeSubaction(
        (action) => {
          // this.generatePlanetTerrain(planet, plateCount, oceanicRate, heatLevel, moistureLevel, random, action);
        },
        8,
        'Generating Terrain'
      )
      .executeSubaction(
        (action) => {
          // this.generatePlanetRenderData(planet.topology, random, action);
        },
        1,
        'Building Visuals'
      )
      .getResult((result) => {
        // planet.renderData = result;
      })
      .executeSubaction(
        (action) => {
          // this.generatePlanetStatistics(planet.topology, planet.plates, action);
        },
        1,
        'Compiling Statistics'
      )
      .getResult((result) => {
        // planet.statistics = result;
        //console.log('$planet obiekt planety:');
        // console.log(planet);
      })
      .provideResult(planet)
  }

  generatePlanetMesh(
    icosahedronSubdivision,
    topologyDistortionRate,
    random,
    action
  ) {
    var mesh
    action.executeSubaction(
      (action) => {
        mesh = this.generateSubdividedIcosahedron(icosahedronSubdivision)
      },
      1,
      'Generating Subdivided Icosahedron'
    )

    action.executeSubaction(
      (action) => {
        var totalDistortion = Math.ceil(
          mesh.edges.length * topologyDistortionRate
        )
        var remainingIterations = 6
        action.executeSubaction((action) => {
          var iterationDistortion = Math.floor(
            totalDistortion / remainingIterations
          )
          totalDistortion -= iterationDistortion
          action.executeSubaction((action) => {
            this.distortMesh(mesh, iterationDistortion, random, action)
          })
          action.executeSubaction((action) => {
            this.relaxMesh(mesh, 0.5, action)
          })
          --remainingIterations
          if (remainingIterations > 0) action.loop(1 - remainingIterations / 6)
        })
      },
      15,
      'Distorting Triangle Mesh'
    )

    action.executeSubaction(
      (action) => {
        var initialIntervalIteration = action.intervalIteration

        var averageNodeRadius = Math.sqrt((4 * Math.PI) / mesh.nodes.length)
        var minShiftDelta = (averageNodeRadius / 50000) * mesh.nodes.length
        var maxShiftDelta = (averageNodeRadius / 50) * mesh.nodes.length

        var priorShift
        var currentShift = this.relaxMesh(mesh, 0.5, action)
        action.executeSubaction((action) => {
          priorShift = currentShift
          currentShift = this.relaxMesh(mesh, 0.5, action)
          var shiftDelta = Math.abs(currentShift - priorShift)
          if (
            shiftDelta >= minShiftDelta &&
            action.intervalIteration - initialIntervalIteration < 300
          ) {
            action.loop(
              Math.pow(
                Math.max(
                  0,
                  (maxShiftDelta - shiftDelta) / (maxShiftDelta - minShiftDelta)
                ),
                4
              )
            )
          }
        })
      },
      25,
      'Relaxing Triangle Mesh'
    )

    action.executeSubaction(
      (action) => {
        for (var i = 0; i < mesh.faces.length; ++i) {
          var face = mesh.faces[i]
          var p0 = mesh.nodes[face.n[0]].p
          var p1 = mesh.nodes[face.n[1]].p
          var p2 = mesh.nodes[face.n[2]].p
          face.centroid = this.calculateFaceCentroid(p0, p1, p2).normalize()
        }
      },
      1,
      'Calculating Triangle Centroids'
    )

    action.executeSubaction(
      (action) => {
        for (var i = 0; i < mesh.nodes.length; ++i) {
          var node = mesh.nodes[i]
          var faceIndex = node.f[0]
          for (var j = 1; j < node.f.length - 1; ++j) {
            faceIndex = this.findNextFaceIndex(mesh, i, faceIndex)
            var k = node.f.indexOf(faceIndex)
            node.f[k] = node.f[j]
            node.f[j] = faceIndex
          }
        }
      },
      1,
      'Reordering Triangle Nodes'
    )

    action.provideResult(function () {
      return mesh
    })
  }

  //##########################################################################
  generateSubdividedIcosahedron(degree) {
    var icosahedron = this.generateIcosahedron()

    var nodes = []
    for (var i = 0; i < icosahedron.nodes.length; ++i) {
      nodes.push({ p: icosahedron.nodes[i].p, e: [], f: [] })
    }

    var edges = []
    for (var i = 0; i < icosahedron.edges.length; ++i) {
      var edge = icosahedron.edges[i]
      edge.subdivided_n = []
      edge.subdivided_e = []
      var n0 = icosahedron.nodes[edge.n[0]]
      var n1 = icosahedron.nodes[edge.n[1]]
      var p0 = n0.p
      var p1 = n1.p
      var delta = p1.clone().sub(p0)
      nodes[edge.n[0]].e.push(edges.length)
      var priorNodeIndex = edge.n[0]
      for (var s = 1; s < degree; ++s) {
        var edgeIndex = edges.length
        var nodeIndex = nodes.length
        edge.subdivided_e.push(edgeIndex)
        edge.subdivided_n.push(nodeIndex)
        edges.push({ n: [priorNodeIndex, nodeIndex], f: [] })
        priorNodeIndex = nodeIndex
        nodes.push({
          p: slerp(p0, p1, s / degree),
          e: [edgeIndex, edgeIndex + 1],
          f: []
        })
      }
      edge.subdivided_e.push(edges.length)
      nodes[edge.n[1]].e.push(edges.length)
      edges.push({ n: [priorNodeIndex, edge.n[1]], f: [] })
    }

    var faces = []
    for (var i = 0; i < icosahedron.faces.length; ++i) {
      var face = icosahedron.faces[i]
      var edge0 = icosahedron.edges[face.e[0]]
      var edge1 = icosahedron.edges[face.e[1]]
      var edge2 = icosahedron.edges[face.e[2]]
      var point0 = icosahedron.nodes[face.n[0]].p
      var point1 = icosahedron.nodes[face.n[1]].p
      var point2 = icosahedron.nodes[face.n[2]].p
      var delta = point1.clone().sub(point0)

      var getEdgeNode0 =
        face.n[0] === edge0.n[0]
          ? function (k) {
              return edge0.subdivided_n[k]
            }
          : function (k) {
              return edge0.subdivided_n[degree - 2 - k]
            }
      var getEdgeNode1 =
        face.n[1] === edge1.n[0]
          ? function (k) {
              return edge1.subdivided_n[k]
            }
          : function (k) {
              return edge1.subdivided_n[degree - 2 - k]
            }
      var getEdgeNode2 =
        face.n[0] === edge2.n[0]
          ? function (k) {
              return edge2.subdivided_n[k]
            }
          : function (k) {
              return edge2.subdivided_n[degree - 2 - k]
            }

      var faceNodes = []
      faceNodes.push(face.n[0])
      for (var j = 0; j < edge0.subdivided_n.length; ++j)
        faceNodes.push(getEdgeNode0(j))
      faceNodes.push(face.n[1])
      for (var s = 1; s < degree; ++s) {
        faceNodes.push(getEdgeNode2(s - 1))
        var p0 = nodes[getEdgeNode2(s - 1)].p
        var p1 = nodes[getEdgeNode1(s - 1)].p
        for (var t = 1; t < degree - s; ++t) {
          faceNodes.push(nodes.length)
          nodes.push({ p: slerp(p0, p1, t / (degree - s)), e: [], f: [] })
        }
        faceNodes.push(getEdgeNode1(s - 1))
      }
      faceNodes.push(face.n[2])

      var getEdgeEdge0 =
        face.n[0] === edge0.n[0]
          ? function (k) {
              return edge0.subdivided_e[k]
            }
          : function (k) {
              return edge0.subdivided_e[degree - 1 - k]
            }
      var getEdgeEdge1 =
        face.n[1] === edge1.n[0]
          ? function (k) {
              return edge1.subdivided_e[k]
            }
          : function (k) {
              return edge1.subdivided_e[degree - 1 - k]
            }
      var getEdgeEdge2 =
        face.n[0] === edge2.n[0]
          ? function (k) {
              return edge2.subdivided_e[k]
            }
          : function (k) {
              return edge2.subdivided_e[degree - 1 - k]
            }

      var faceEdges0 = []
      for (var j = 0; j < degree; ++j) faceEdges0.push(getEdgeEdge0(j))
      var nodeIndex = degree + 1
      for (var s = 1; s < degree; ++s) {
        for (var t = 0; t < degree - s; ++t) {
          faceEdges0.push(edges.length)
          var edge = {
            n: [faceNodes[nodeIndex], faceNodes[nodeIndex + 1]],
            f: []
          }
          nodes[edge.n[0]].e.push(edges.length)
          nodes[edge.n[1]].e.push(edges.length)
          edges.push(edge)
          ++nodeIndex
        }
        ++nodeIndex
      }

      var faceEdges1 = []
      nodeIndex = 1
      for (var s = 0; s < degree; ++s) {
        for (var t = 1; t < degree - s; ++t) {
          faceEdges1.push(edges.length)
          var edge = {
            n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s]],
            f: []
          }
          nodes[edge.n[0]].e.push(edges.length)
          nodes[edge.n[1]].e.push(edges.length)
          edges.push(edge)
          ++nodeIndex
        }
        faceEdges1.push(getEdgeEdge1(s))
        nodeIndex += 2
      }

      var faceEdges2 = []
      nodeIndex = 1
      for (var s = 0; s < degree; ++s) {
        faceEdges2.push(getEdgeEdge2(s))
        for (var t = 1; t < degree - s; ++t) {
          faceEdges2.push(edges.length)
          var edge = {
            n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s + 1]],
            f: []
          }
          nodes[edge.n[0]].e.push(edges.length)
          nodes[edge.n[1]].e.push(edges.length)
          edges.push(edge)
          ++nodeIndex
        }
        nodeIndex += 2
      }

      nodeIndex = 0
      edgeIndex = 0
      for (var s = 0; s < degree; ++s) {
        for (t = 1; t < degree - s + 1; ++t) {
          var subFace = {
            n: [
              faceNodes[nodeIndex],
              faceNodes[nodeIndex + 1],
              faceNodes[nodeIndex + degree - s + 1]
            ],
            e: [
              faceEdges0[edgeIndex],
              faceEdges1[edgeIndex],
              faceEdges2[edgeIndex]
            ]
          }
          nodes[subFace.n[0]].f.push(faces.length)
          nodes[subFace.n[1]].f.push(faces.length)
          nodes[subFace.n[2]].f.push(faces.length)
          edges[subFace.e[0]].f.push(faces.length)
          edges[subFace.e[1]].f.push(faces.length)
          edges[subFace.e[2]].f.push(faces.length)
          faces.push(subFace)
          ++nodeIndex
          ++edgeIndex
        }
        ++nodeIndex
      }

      nodeIndex = 1
      edgeIndex = 0
      for (var s = 1; s < degree; ++s) {
        for (t = 1; t < degree - s + 1; ++t) {
          var subFace = {
            n: [
              faceNodes[nodeIndex],
              faceNodes[nodeIndex + degree - s + 2],
              faceNodes[nodeIndex + degree - s + 1]
            ],
            e: [
              faceEdges2[edgeIndex + 1],
              faceEdges0[edgeIndex + degree - s + 1],
              faceEdges1[edgeIndex]
            ]
          }
          nodes[subFace.n[0]].f.push(faces.length)
          nodes[subFace.n[1]].f.push(faces.length)
          nodes[subFace.n[2]].f.push(faces.length)
          edges[subFace.e[0]].f.push(faces.length)
          edges[subFace.e[1]].f.push(faces.length)
          edges[subFace.e[2]].f.push(faces.length)
          faces.push(subFace)
          ++nodeIndex
          ++edgeIndex
        }
        nodeIndex += 2
        edgeIndex += 1
      }
    }
    return { nodes: nodes, edges: edges, faces: faces }
  }

  //##########################################################################
  generateIcosahedron() {
    var phi = (1.0 + Math.sqrt(5.0)) / 2.0
    var du = 1.0 / Math.sqrt(phi * phi + 1.0)
    var dv = phi * du

    var nodes = [
      { p: new THREE.Vector3(0, +dv, +du), e: [], f: [] },
      { p: new THREE.Vector3(0, +dv, -du), e: [], f: [] },
      { p: new THREE.Vector3(0, -dv, +du), e: [], f: [] },
      { p: new THREE.Vector3(0, -dv, -du), e: [], f: [] },
      { p: new THREE.Vector3(+du, 0, +dv), e: [], f: [] },
      { p: new THREE.Vector3(-du, 0, +dv), e: [], f: [] },
      { p: new THREE.Vector3(+du, 0, -dv), e: [], f: [] },
      { p: new THREE.Vector3(-du, 0, -dv), e: [], f: [] },
      { p: new THREE.Vector3(+dv, +du, 0), e: [], f: [] },
      { p: new THREE.Vector3(+dv, -du, 0), e: [], f: [] },
      { p: new THREE.Vector3(-dv, +du, 0), e: [], f: [] },
      { p: new THREE.Vector3(-dv, -du, 0), e: [], f: [] }
    ]

    var edges = [
      { n: [0, 1], f: [] },
      { n: [0, 4], f: [] },
      { n: [0, 5], f: [] },
      { n: [0, 8], f: [] },
      { n: [0, 10], f: [] },
      { n: [1, 6], f: [] },
      { n: [1, 7], f: [] },
      { n: [1, 8], f: [] },
      { n: [1, 10], f: [] },
      { n: [2, 3], f: [] },
      { n: [2, 4], f: [] },
      { n: [2, 5], f: [] },
      { n: [2, 9], f: [] },
      { n: [2, 11], f: [] },
      { n: [3, 6], f: [] },
      { n: [3, 7], f: [] },
      { n: [3, 9], f: [] },
      { n: [3, 11], f: [] },
      { n: [4, 5], f: [] },
      { n: [4, 8], f: [] },
      { n: [4, 9], f: [] },
      { n: [5, 10], f: [] },
      { n: [5, 11], f: [] },
      { n: [6, 7], f: [] },
      { n: [6, 8], f: [] },
      { n: [6, 9], f: [] },
      { n: [7, 10], f: [] },
      { n: [7, 11], f: [] },
      { n: [8, 9], f: [] },
      { n: [10, 11], f: [] }
    ]

    var faces = [
      { n: [0, 1, 8], e: [0, 7, 3] },
      { n: [0, 4, 5], e: [1, 18, 2] },
      { n: [0, 5, 10], e: [2, 21, 4] },
      { n: [0, 8, 4], e: [3, 19, 1] },
      { n: [0, 10, 1], e: [4, 8, 0] },
      { n: [1, 6, 8], e: [5, 24, 7] },
      { n: [1, 7, 6], e: [6, 23, 5] },
      { n: [1, 10, 7], e: [8, 26, 6] },
      { n: [2, 3, 11], e: [9, 17, 13] },
      { n: [2, 4, 9], e: [10, 20, 12] },
      { n: [2, 5, 4], e: [11, 18, 10] },
      { n: [2, 9, 3], e: [12, 16, 9] },
      { n: [2, 11, 5], e: [13, 22, 11] },
      { n: [3, 6, 7], e: [14, 23, 15] },
      { n: [3, 7, 11], e: [15, 27, 17] },
      { n: [3, 9, 6], e: [16, 25, 14] },
      { n: [4, 8, 9], e: [19, 28, 20] },
      { n: [5, 11, 10], e: [22, 29, 21] },
      { n: [6, 9, 8], e: [25, 28, 24] },
      { n: [7, 10, 11], e: [26, 29, 27] }
    ]

    for (var i = 0; i < edges.length; ++i)
      for (var j = 0; j < edges[i].n.length; ++j) nodes[j].e.push(i)

    for (var i = 0; i < faces.length; ++i)
      for (var j = 0; j < faces[i].n.length; ++j) nodes[j].f.push(i)

    for (var i = 0; i < faces.length; ++i)
      for (var j = 0; j < faces[i].e.length; ++j) edges[j].f.push(i)

    return { nodes: nodes, edges: edges, faces: faces }
  }

  //##########################################################################
  distortMesh(mesh, degree, random, action) {
    var totalSurfaceArea = 4 * Math.PI
    var idealFaceArea = totalSurfaceArea / mesh.faces.length
    var idealEdgeLength = Math.sqrt((idealFaceArea * 4) / Math.sqrt(3))
    var idealFaceHeight = (idealEdgeLength * Math.sqrt(3)) / 2

    var rotationPredicate = function (oldNode0, oldNode1, newNode0, newNode1) {
      if (
        newNode0.f.length >= 7 ||
        newNode1.f.length >= 7 ||
        oldNode0.f.length <= 5 ||
        oldNode1.f.length <= 5
      )
        return false
      var oldEdgeLength = oldNode0.p.distanceTo(oldNode1.p)
      var newEdgeLength = newNode0.p.distanceTo(newNode1.p)
      var ratio = oldEdgeLength / newEdgeLength
      if (ratio >= 2 || ratio <= 0.5) return false
      var v0 = oldNode1.p.clone().sub(oldNode0.p).divideScalar(oldEdgeLength)
      var v1 = newNode0.p.clone().sub(oldNode0.p).normalize()
      var v2 = newNode1.p.clone().sub(oldNode0.p).normalize()
      if (v0.dot(v1) < 0.2 || v0.dot(v2) < 0.2) return false
      v0.negate()
      var v3 = newNode0.p.clone().sub(oldNode1.p).normalize()
      var v4 = newNode1.p.clone().sub(oldNode1.p).normalize()
      if (v0.dot(v3) < 0.2 || v0.dot(v4) < 0.2) return false
      return true
    }

    var i = 0
    action.executeSubaction((action) => {
      if (i >= degree) return

      var consecutiveFailedAttempts = 0
      var edgeIndex = random.integerExclusive(0, mesh.edges.length)
      while (!this.conditionalRotateEdge(mesh, edgeIndex, rotationPredicate)) {
        if (++consecutiveFailedAttempts >= mesh.edges.length) return false
        edgeIndex = (edgeIndex + 1) % mesh.edges.length
      }

      ++i
      action.loop(i / degree)
    })
    return true
  }

  //##########################################################################
  relaxMesh(mesh, multiplier, action) {
    var totalSurfaceArea = 4 * Math.PI
    var idealFaceArea = totalSurfaceArea / mesh.faces.length
    var idealEdgeLength = Math.sqrt((idealFaceArea * 4) / Math.sqrt(3))
    var idealDistanceToCentroid = ((idealEdgeLength * Math.sqrt(3)) / 3) * 0.9

    var pointShifts = new Array(mesh.nodes.length)
    action.executeSubaction(function (action) {
      for (var i = 0; i < mesh.nodes.length; ++i)
        pointShifts[i] = new THREE.Vector3(0, 0, 0)
    }, 1)

    var i = 0
    action.executeSubaction((action) => {
      if (i >= mesh.faces.length) return

      var face = mesh.faces[i]
      var n0 = mesh.nodes[face.n[0]]
      var n1 = mesh.nodes[face.n[1]]
      var n2 = mesh.nodes[face.n[2]]
      var p0 = n0.p
      var p1 = n1.p
      var p2 = n2.p
      var e0 = p1.distanceTo(p0) / idealEdgeLength
      var e1 = p2.distanceTo(p1) / idealEdgeLength
      var e2 = p0.distanceTo(p2) / idealEdgeLength
      var centroid = this.calculateFaceCentroid(p0, p1, p2).normalize()
      var v0 = centroid.clone().sub(p0)
      var v1 = centroid.clone().sub(p1)
      var v2 = centroid.clone().sub(p2)
      var length0 = v0.length()
      var length1 = v1.length()
      var length2 = v2.length()
      v0.multiplyScalar(
        (multiplier * (length0 - idealDistanceToCentroid)) / length0
      )
      v1.multiplyScalar(
        (multiplier * (length1 - idealDistanceToCentroid)) / length1
      )
      v2.multiplyScalar(
        (multiplier * (length2 - idealDistanceToCentroid)) / length2
      )
      pointShifts[face.n[0]].add(v0)
      pointShifts[face.n[1]].add(v1)
      pointShifts[face.n[2]].add(v2)

      ++i
      action.loop(i / mesh.faces.length)
    }, mesh.faces.length)

    var origin = new THREE.Vector3(0, 0, 0)
    var plane = new THREE.Plane()
    action.executeSubaction(function (action) {
      for (var i = 0; i < mesh.nodes.length; ++i) {
        plane.setFromNormalAndCoplanarPoint(mesh.nodes[i].p, origin)
        pointShifts[i] = mesh.nodes[i].p
          .clone()
          .add(plane.projectPoint(pointShifts[i]))
          .normalize()
      }
    }, mesh.nodes.length / 10)

    var rotationSupressions = new Array(mesh.nodes.length)
    for (var i = 0; i < mesh.nodes.length; ++i) rotationSupressions[i] = 0

    var i = 0
    action.executeSubaction(function (action) {
      if (i >= mesh.edges.length) return

      var edge = mesh.edges[i]
      var oldPoint0 = mesh.nodes[edge.n[0]].p
      var oldPoint1 = mesh.nodes[edge.n[1]].p
      var newPoint0 = pointShifts[edge.n[0]]
      var newPoint1 = pointShifts[edge.n[1]]
      var oldVector = oldPoint1.clone().sub(oldPoint0).normalize()
      var newVector = newPoint1.clone().sub(newPoint0).normalize()
      var suppression = (1 - oldVector.dot(newVector)) * 0.5
      rotationSupressions[edge.n[0]] = Math.max(
        rotationSupressions[edge.n[0]],
        suppression
      )
      rotationSupressions[edge.n[1]] = Math.max(
        rotationSupressions[edge.n[1]],
        suppression
      )

      ++i
      action.loop(i / mesh.edges.length)
    })

    var totalShift = 0
    action.executeSubaction(function (action) {
      for (var i = 0; i < mesh.nodes.length; ++i) {
        var node = mesh.nodes[i]
        var point = node.p
        var delta = point.clone()
        point
          .lerp(pointShifts[i], 1 - Math.sqrt(rotationSupressions[i]))
          .normalize()
        delta.sub(point)
        totalShift += delta.length()
      }
    }, mesh.nodes.length / 20)
    return totalShift
  }

  //##########################################################################
  conditionalRotateEdge(mesh, edgeIndex, predicate) {
    var edge = mesh.edges[edgeIndex]
    var face0 = mesh.faces[edge.f[0]]
    var face1 = mesh.faces[edge.f[1]]
    var farNodeFaceIndex0 = this.getFaceOppositeNodeIndex(face0, edge)
    var farNodeFaceIndex1 = this.getFaceOppositeNodeIndex(face1, edge)
    var newNodeIndex0 = face0.n[farNodeFaceIndex0]
    var oldNodeIndex0 = face0.n[(farNodeFaceIndex0 + 1) % 3]
    var newNodeIndex1 = face1.n[farNodeFaceIndex1]
    var oldNodeIndex1 = face1.n[(farNodeFaceIndex1 + 1) % 3]
    var oldNode0 = mesh.nodes[oldNodeIndex0]
    var oldNode1 = mesh.nodes[oldNodeIndex1]
    var newNode0 = mesh.nodes[newNodeIndex0]
    var newNode1 = mesh.nodes[newNodeIndex1]
    var newEdgeIndex0 = face1.e[(farNodeFaceIndex1 + 2) % 3]
    var newEdgeIndex1 = face0.e[(farNodeFaceIndex0 + 2) % 3]
    var newEdge0 = mesh.edges[newEdgeIndex0]
    var newEdge1 = mesh.edges[newEdgeIndex1]

    if (!predicate(oldNode0, oldNode1, newNode0, newNode1)) return false

    oldNode0.e.splice(oldNode0.e.indexOf(edgeIndex), 1)
    oldNode1.e.splice(oldNode1.e.indexOf(edgeIndex), 1)
    newNode0.e.push(edgeIndex)
    newNode1.e.push(edgeIndex)

    edge.n[0] = newNodeIndex0
    edge.n[1] = newNodeIndex1

    newEdge0.f.splice(newEdge0.f.indexOf(edge.f[1]), 1)
    newEdge1.f.splice(newEdge1.f.indexOf(edge.f[0]), 1)
    newEdge0.f.push(edge.f[0])
    newEdge1.f.push(edge.f[1])

    oldNode0.f.splice(oldNode0.f.indexOf(edge.f[1]), 1)
    oldNode1.f.splice(oldNode1.f.indexOf(edge.f[0]), 1)
    newNode0.f.push(edge.f[1])
    newNode1.f.push(edge.f[0])

    face0.n[(farNodeFaceIndex0 + 2) % 3] = newNodeIndex1
    face1.n[(farNodeFaceIndex1 + 2) % 3] = newNodeIndex0

    face0.e[(farNodeFaceIndex0 + 1) % 3] = newEdgeIndex0
    face1.e[(farNodeFaceIndex1 + 1) % 3] = newEdgeIndex1
    face0.e[(farNodeFaceIndex0 + 2) % 3] = edgeIndex
    face1.e[(farNodeFaceIndex1 + 2) % 3] = edgeIndex

    return true
  }

  //##########################################################################
  getFaceOppositeNodeIndex(face, edge) {
    if (face.n[0] !== edge.n[0] && face.n[0] !== edge.n[1]) return 0
    if (face.n[1] !== edge.n[0] && face.n[1] !== edge.n[1]) return 1
    if (face.n[2] !== edge.n[0] && face.n[2] !== edge.n[1]) return 2
    throw 'Cannot find node of given face that is not also a node of given edge.'
  }

  calculateFaceCentroid(pa, pb, pc) {
    var vabHalf = pb.clone().sub(pa).divideScalar(2)
    var pabHalf = pa.clone().add(vabHalf)
    var centroid = pc
      .clone()
      .sub(pabHalf)
      .multiplyScalar(1 / 3)
      .add(pabHalf)
    return centroid
  }

  findNextFaceIndex(mesh, nodeIndex, faceIndex) {
    var node = mesh.nodes[nodeIndex]
    var face = mesh.faces[faceIndex]
    var nodeFaceIndex = face.n.indexOf(nodeIndex)
    var edge = mesh.edges[face.e[(nodeFaceIndex + 2) % 3]]
    return this.getEdgeOppositeFaceIndex(edge, faceIndex)
  }

  getEdgeOppositeFaceIndex(edge, faceIndex) {
    if (edge.f[0] === faceIndex) return edge.f[1]
    if (edge.f[1] === faceIndex) return edge.f[0]
    throw 'Given face is not part of given edge.'
  }
  // ###########################################################################

  // =========================================================================
  /*
   *   TOPOLOGY
   */
  generatePlanetTopology(mesh, action) {
    var corners = new Array(mesh.faces.length)
    var borders = new Array(mesh.edges.length)
    var tiles = new Array(mesh.nodes.length)

    action.executeSubaction((action) => {
      for (var i = 0; i < mesh.faces.length; ++i) {
        var face = mesh.faces[i]
        corners[i] = new Corner(
          i,
          face.centroid.clone().multiplyScalar(1000),
          face.e.length,
          face.e.length,
          face.n.length
        )
      }
    })

    action.executeSubaction(function (action) {
      for (var i = 0; i < mesh.edges.length; ++i) {
        var edge = mesh.edges[i]
        borders[i] = new Border(i, 2, 4, 2) //edge.f.length, mesh.faces[edge.f[0]].e.length + mesh.faces[edge.f[1]].e.length - 2, edge.n.length
      }
    })

    action.executeSubaction(function (action) {
      for (var i = 0; i < mesh.nodes.length; ++i) {
        var node = mesh.nodes[i]
        tiles[i] = new Tile(
          i,
          node.p.clone().multiplyScalar(1000),
          node.f.length,
          node.e.length,
          node.e.length
        )
      }
      //console.log('$planet generation');
      //console.log(tiles);
    })

    action.executeSubaction(function (action) {
      for (var i = 0; i < corners.length; ++i) {
        var corner = corners[i]
        var face = mesh.faces[i]
        for (var j = 0; j < face.e.length; ++j) {
          corner.borders[j] = borders[face.e[j]]
        }
        for (var j = 0; j < face.n.length; ++j) {
          corner.tiles[j] = tiles[face.n[j]]
        }
      }
    })

    action.executeSubaction(function (action) {
      for (var i = 0; i < borders.length; ++i) {
        var border = borders[i]
        var edge = mesh.edges[i]
        var averageCorner = new THREE.Vector3(0, 0, 0)
        var n = 0
        for (var j = 0; j < edge.f.length; ++j) {
          var corner = corners[edge.f[j]]
          averageCorner.add(corner.position)
          border.corners[j] = corner
          for (var k = 0; k < corner.borders.length; ++k) {
            if (corner.borders[k] !== border)
              border.borders[n++] = corner.borders[k]
          }
        }
        border.midpoint = averageCorner.multiplyScalar(
          1 / border.corners.length
        )
        for (var j = 0; j < edge.n.length; ++j) {
          border.tiles[j] = tiles[edge.n[j]]
        }
      }
    })

    action.executeSubaction(function (action) {
      for (var i = 0; i < corners.length; ++i) {
        var corner = corners[i]
        for (var j = 0; j < corner.borders.length; ++j) {
          corner.corners[j] = corner.borders[j].oppositeCorner(corner)
        }
      }
    })

    action.executeSubaction((action) => {
      for (var i = 0; i < tiles.length; ++i) {
        var tile = tiles[i]
        var node = mesh.nodes[i]
        for (var j = 0; j < node.f.length; ++j) {
          tile.corners[j] = corners[node.f[j]]
        }
        for (var j = 0; j < node.e.length; ++j) {
          var border = borders[node.e[j]]
          if (border.tiles[0] === tile) {
            for (var k = 0; k < tile.corners.length; ++k) {
              var corner0 = tile.corners[k]
              var corner1 = tile.corners[(k + 1) % tile.corners.length]
              if (
                border.corners[1] === corner0 &&
                border.corners[0] === corner1
              ) {
                border.corners[0] = corner0
                border.corners[1] = corner1
              } else if (
                border.corners[0] !== corner0 ||
                border.corners[1] !== corner1
              ) {
                continue
              }
              tile.borders[k] = border
              tile.tiles[k] = border.oppositeTile(tile)
              break
            }
          } else {
            for (var k = 0; k < tile.corners.length; ++k) {
              var corner0 = tile.corners[k]
              var corner1 = tile.corners[(k + 1) % tile.corners.length]
              if (
                border.corners[0] === corner0 &&
                border.corners[1] === corner1
              ) {
                border.corners[1] = corner0
                border.corners[0] = corner1
              } else if (
                border.corners[1] !== corner0 ||
                border.corners[0] !== corner1
              ) {
                continue
              }
              tile.borders[k] = border
              tile.tiles[k] = border.oppositeTile(tile)
              break
            }
          }
        }

        tile.averagePosition = new THREE.Vector3(0, 0, 0)
        for (var j = 0; j < tile.corners.length; ++j) {
          tile.averagePosition.add(tile.corners[j].position)
        }
        tile.averagePosition.multiplyScalar(1 / tile.corners.length)

        var maxDistanceToCorner = 0
        for (var j = 0; j < tile.corners.length; ++j) {
          maxDistanceToCorner = Math.max(
            maxDistanceToCorner,
            tile.corners[j].position.distanceTo(tile.averagePosition)
          )
        }

        var area = 0
        for (var j = 0; j < tile.borders.length; ++j) {
          area += calculateTriangleArea(
            tile.position,
            tile.borders[j].corners[0].position,
            tile.borders[j].corners[1].position
          )
        }
        tile.area = area
        tile.normal = tile.position.clone().normalize()
        tile.boundingSphere = new THREE.Sphere(
          tile.averagePosition,
          maxDistanceToCorner
        )
      }
    })

    action.executeSubaction(function (action) {
      for (var i = 0; i < corners.length; ++i) {
        var corner = corners[i]
        corner.area = 0
        for (var j = 0; j < corner.tiles.length; ++j) {
          corner.area += corner.tiles[j].area / corner.tiles[j].corners.length
        }
      }
    })
    action.provideResult({ corners: corners, borders: borders, tiles: tiles })
  }
  // END TOPOLOGY ============================================================
}

export default PlanetSurfaceGenerator
