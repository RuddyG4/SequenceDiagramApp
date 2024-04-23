import joint from "@joint/core";

const shapesMap = {
  rectangle: createRectangle,
  circle: createCircle,
  actor: createActor,
  object: createObject,
  activationBox: createActivationBox,
  alternativeBox: createAlternativeBox,
};

const linksMap = {
  link: createLink,
};

export function createNewShape(shapeToCreate, paperDimensions) {
  let shape = shapesMap[shapeToCreate]();
  shape.position(
    paperDimensions.width / 2 - shape.size().width / 2,
    paperDimensions.height / 2 - shape.size().height / 2
  );
  return shape;
}

export function createNewLink(linkToCreate, paperDimensions) {
  return linksMap[linkToCreate](paperDimensions);
}

function createRectangle() {
  const rect = new joint.shapes.standard.Rectangle();
  rect.size(100, 80);
  rect.attr({
    body: {
      fill: "transparent",
    },
    // label: {
    //   text: "Hello",
    //   fill: "black",
    // },
  });
  return rect;
}

function createCircle() {
  const circle = new joint.shapes.standard.Circle();
  circle.size(80, 80);
  circle.attr({
    body: {
      fill: "transparent",
    },
  });
  return circle;
}

function createLink(paperDimensions) {
  let link = new joint.shapes.standard.Link();
  link.prop("source", {
    x: paperDimensions.width / 2 - 50,
    y: paperDimensions.height / 2,
    anchor: {
      name: "center",
      args: {
        dx: 30,
      },
    },
  });
  link.prop("target", {
    x: paperDimensions.width / 2 + 50,
    y: paperDimensions.height / 2,
    anchor: {
      name: "center",
      args: {
        dx: -30,
      },
    },
    connectionPoint: {
      name: "boundary",
    },
  });
  link.prop("vertices", [
    { x: paperDimensions.width / 2 + 50, y: paperDimensions.height / 2 },
  ]);
  link.attr("root/title", "joint.shapes.standard.Link");
  link.attr("line/stroke", "#fe854f");
  return link;
}

// SEQUENCE DIAGRAM SHAPES
function createActor() {
  const actorShape = new joint.shapes.sequenceDiagram.ActorShape({
    size: { width: 40, height: 100 },
  });
  return actorShape;
}

function createObject() {
  const objectShape = new joint.shapes.sequenceDiagram.ObjectShape({
    size: { width: 150, height: 500 },
  });
  return objectShape;
}

function createActivationBox() {
  const ActivationBox = new joint.shapes.sequenceDiagram.ActivationBox({
    size: { width: 10, height: 350 },
  });
  return ActivationBox;
}

function createAlternativeBox() {
  const alternativeBox = new joint.shapes.sequenceDiagram.AlternativeBox({
    size: { width: 500, height: 250 },
  });
  return alternativeBox;
}
