import * as joint from "@joint/core";

var standard = joint.shapes.standard;
var dia = joint.dia;

const RoleGroup = standard.Rectangle.define(
  "sd.RoleGroup",
  {
    z: 1,
    attrs: {
      body: {
        stroke: "#DDDDDD",
        strokeWidth: 1,
        fill: "#F9FBFA",
      },
      label: {
        refY: null,
        refX: null,
        y: "calc(h+2)",
        x: "calc(w/2)",
        textAnchor: "middle",
        textVerticalAnchor: "top",
        fontSize: 12,
        fontFamily: "sans-serif",
        textWrap: {
          width: -10,
        },
      },
    },
  },
  {
    placeholder: "What's the group's name?",

    fitRoles: function () {
      this.fitToChildren({ padding: 10 });
    },
  }
);

const Role = standard.Rectangle.define(
  "sd.Role",
  {
    z: 2,
    size: { width: 120, height: 60 },
    attrs: {
      body: {
        stroke: "#A0A0A0",
        strokeWidth: 1,
        rx: 2,
        ry: 2,
      },
      label: {
        fontSize: 14,
        fontFamily: "sans-serif",
        textWrap: {
          width: -10,
        },
      },
    },
  },
  {
    placeholder: "What's the role?",

    setName: function (name) {
      this.attr(["label", "text"], name);
    },
  }
);

const Lifeline = standard.Link.define(
  "sd.Lifeline",
  {
    z: 3,
    attrs: {
      line: {
        stroke: "#A0A0A0",
        strokeWidth: 1,
        strokeDasharray: "5,2",
        targetMarker: null,
      },
    },
  },
  {
    attachToRole: function (role, maxY) {
      const roleCenter = role.getBBox().center();
      this.set({
        source: { id: role.id },
        target: { x: roleCenter.x, y: role.position().y + maxY },
      });
      role.embed(this);
    },
    attachToActor: function (actor, maxY) {
      const actorCenter = actor.getBBox().center();
      this.set({
        source: { id: actor.id },
        target: { x: actorCenter.x - actor.size().width / 2, y: actor.position().y + maxY },
      });
      actor.embed(this);
    },
  }
);

const LifeSpan = dia.Link.define(
  "sd.LifeSpan",
  {
    z: 4,
    attrs: {
      line: {
        connection: true,
        stroke: "#222222",
        strokeWidth: 2,
      },
      wrapper: {
        connection: true,
      },
      icon: {
        atConnectionRatioIgnoreGradient: 0.5,
      },
    },
  },
  {
    markup: [
      {
        tagName: "path",
        selector: "line",
        attributes: {
          fill: "none",
          "pointer-events": "none",
        },
      },
      {
        tagName: "path",
        selector: "wrapper",
        attributes: {
          fill: "none",
          stroke: "transparent",
          "stroke-width": 20,
        },
      },
      {
        tagName: "g",
        selector: "icon",
        children: [
          {
            tagName: "circle",
            attributes: {
              r: 12,
              fill: "#222222",
            },
          },
          {
            tagName: "path",
            attributes: {
              d: "M -3 -5 3 -5 3 -2 -3  2 -3 5 3 5 3 2 -3 -2 Z",
              stroke: "#FFFFFF",
              "stroke-width": 1,
              fill: "none",
            },
          },
        ],
      },
    ],
    attachToMessages: function (from, to) {
      this.source(from, {
        anchor: { name: "connectionRatio", args: { ratio: 1 } },
      });
      this.target(to, {
        anchor: { name: "connectionRatio", args: { ratio: 0 } },
      });
    },
  }
);

const Message = standard.Link.define(
  "sd.Message",
  {
    z: 5,
    source: { anchor: { name: "connectionLength" } },
    target: { anchor: { name: "connectionPerpendicular" } },
    attrs: {
      line: {
        stroke: "#000000",
        sourceMarker: {
          type: "path",
          d: "M -3 -3 -3 3 3 3 3 -3 z",
          "stroke-width": 3,
        },
      },
      wrapper: {
        strokeWidth: 20,
        cursor: "grab",
      },
    },
  },
  {
    placeholder: "What's the message?",

    defaultLabel: {
      markup: [
        {
          tagName: "rect",
          selector: "labelBody",
        },
        {
          tagName: "text",
          selector: "labelText",
        },
      ],
      attrs: {
        labelBody: {
          ref: "labelText",
          width: "calc(w + 20)",
          height: "calc(h + 10)",
          x: "calc(x - 10)",
          y: "calc(y - 5)",
          rx: 2,
          ry: 2,
          fill: "#000000",
        },
        labelText: {
          fill: "#FFFFFF",
          fontSize: 12,
          fontFamily: "sans-serif",
          textAnchor: "middle",
          textVerticalAnchor: "middle",
          cursor: "grab",
          y: "calc(y - 12)",
        },
      },
    },
    setStart: function (y) {
      this.prop(["source", "anchor", "args", "length"], y);
    },
    setFromTo: function (from, to) {
      this.prop({
        source: { id: from.id },
        target: { id: to.id },
      });
    },
    setDescription: function (description) {
      this.labels([{ attrs: { labelText: { text: description } } }]);
    },
  }
);

export const sd = { RoleGroup, Role, Lifeline, Message, LifeSpan };

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
      label: {
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
        selector: 'label'
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
