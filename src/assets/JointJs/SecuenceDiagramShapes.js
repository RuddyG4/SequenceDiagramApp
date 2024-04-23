import * as joint from "@joint/core";

const ActorShape = joint.dia.Element.define(
  "sequenceDiagram.ActorShape",
  {
    attrs: {
      body: {
        width: "calc(w)",
        height: "calc(h)",
        x: "calc(-1 * w/2)",
        y: "calc(-1 * h / 10)",
      },
      ellipse: {
        rx: "calc(w / 4)",
        ry: "calc(h / 10)",
      },
      bodyLine: {
        y1: "calc(h / 10)",
        y2: "calc(h / 1.5)",
      },
      leftArmLine: {
        y1: "calc(h / 4)",
        x2: "calc(-1 * w / 2)",
        y2: "calc(h / 4)",
      },
      rightArmLine: {
        y1: "calc(h / 4)",
        x2: "calc(w / 2)",
        y2: "calc(h / 4)",
      },
      leftLegLine: {
        y1: "calc(h / 1.5)",
        x2: "calc(-1 * w / 2)",
        y2: "calc(h / 1.12)",
      },
      rightLegLine: {
        y1: "calc(h / 1.5)",
        x2: "calc(w / 2)",
        y2: "calc(h / 1.11)",
      },
      label: {
        text: 'Actor',
        y: 'calc(h+15)',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        fontSize: 14
    }
    },
  },
  {
    markup: joint.util.svg/* xml */ `
      <rect @selector="body" fill="transparent" />
      <ellipse @selector="ellipse" stroke="black" fill="transparent"/>
      <line @selector="bodyLine" stroke="black"/>
      <line @selector="leftArmLine" stroke="black"/>
      <line @selector="rightArmLine" stroke="black"/>
      <line @selector="leftLegLine" stroke="black"/>
      <line @selector="rightLegLine" stroke="black"/>
      <text @selector="label" />
      `,
  }
);

const ObjectShape = joint.dia.Element.define(
  "sequenceDiagram.ObjectShape",
  {
    attrs: {
      body: {
        width: "calc(w)",
        height: "calc(h)",
        fill: "transparent",
        stroke: "silver",
      },
      object: {
        width: "calc(0.92 * w)",
        height: "calc(w/3)",
        x: "calc(0.04 * w)",
        y: "calc(0.04 * w)",
        fill: "white",
        stroke: "black",
      },
      lifeLine: {
        x1: "calc(0.5 * w)",
        y1: "calc(w/3 + calc(0.04 * w))",
        x2: "calc(0.5 * w)",
        y2: "calc(h - calc(0.04 * w))",
        stroke: "black",
        strokeDasharray: "8",
      },
      label: {
        text: 'Object',
        x: 'calc(0.5 * w)',
        y: 'calc(0.5 * w/3)',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle'
      }
    },
  },
  {
    markup: [
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "rect",
        selector: "object",
      },
      {
        tagName: "line",
        selector: "lifeLine",
      },
      {
        tagName: "text",
        selector: "label"
      }
    ],
  }
);

const ActivationBox = joint.dia.Element.define(
  "sequenceDiagram.ActivationBox",
  {
    attrs: {
      activationBox: {
        width: 15,
        height: "calc(h)",
        fill: "white",
        stroke: "black",
      },
    },
  },
  {
    markup: [
      {
        tagName: "rect",
        selector: "activationBox",
      },
    ],
  }
);

const AlternativeBox = joint.dia.Element.define(
  "sequenceDiagram.AlternativeBox",
  {
    attrs: {
      alternativeBox: {
        width: 'calc(w)',
        height: 'calc(h)',
        fill: 'transparent',
        stroke: 'black',
      },
      text: {
        text: 'Alt',
        fill: 'black',
        x: 8,
        y: 16
      },
      line1: {
        x1: 0,
        y1: 30,
        x2: 'calc(0.16 * w)',
        y2: 30,
        stroke: 'black'
      },
      line2: {
        x1: 'calc(0.16 * w)',
        y1: 30,
        x2: 'calc(0.20 * w)',
        y2: 20,
        stroke: 'black'
      },
      line3: {
        x1: 'calc(0.20 * w)',
        y1: 20,
        x2: 'calc(0.20 * w)',
        y2: 0,
        stroke: 'black'
      },
    }
  },
  {
    markup: [
      {
        tagName: 'rect',
        selector: 'alternativeBox',
      },
      {
        tagName: 'text',
        selector: 'text'
      },
      {
        tagName: 'line',
        selector: 'line1'
      },
      {
        tagName: 'line',
        selector: 'line2'
      },
      {
        tagName: 'line',
        selector: 'line3'
      }
    ],
  }
);

export const sequenceDiagramShapes = {
  ActorShape,
  ObjectShape,
  ActivationBox,
  AlternativeBox,
};
