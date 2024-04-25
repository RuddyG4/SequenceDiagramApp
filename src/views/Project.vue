<script setup>
import * as joint from "@joint/core";
import { useRoute } from "vue-router";
import { ref as vRef, onMounted, watch, computed } from "vue";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import ShapeButton from "./Components/Project/ShapeButton.vue";
import ProjectControls from "./Components/Project/ProjectControls.vue";
import { sequenceDiagramShapes } from "@/assets/JointJs/SecuenceDiagramShapes";
import { sd } from "@/assets/JointJs/joint.shapes.sd";
import { createNewShape, createNewLink } from "@/assets/JointJs/Shapes";
import { initializeSequenceDiagram } from "@/assets/JointJs/Sequence";
import { FwbTab, FwbTabs, FwbInput, FwbButton } from "flowbite-vue";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const graphContainer = vRef(null);
const route = useRoute();
const projectKey = route.params.projectKey;
const project = vRef({});
const namespace = {
  ...joint.shapes,
  sequenceDiagramShapes,
  sd,
};
const graph = vRef(new joint.dia.Graph({}, { cellNamespace: namespace }));
const paper = vRef(null);
const isChangingGraph = vRef(false);
const selectedCell = vRef(null);
const cellData = vRef({});
const isCreatingRoomCode = vRef(false);
const activeTab = vRef("first");
const message = vRef("");
const messages = vRef([]);

const db = getDatabase();
const projectRef = ref(db, "projects/" + projectKey);

const saveGraph = () => {
  const graphRef = ref(db, "projects/" + projectKey + "/graph");
  set(graphRef, graph.value.toJSON());
};

let stopListeningForProjectChanges = listenForProjectChanges();

onMounted(() => {
  initializeJointJsGraph();
});

function listenForProjectChanges() {
  return onValue(projectRef, (snapshot) => {
    project.value = snapshot.val();
    if (project.value.graph && !isChangingGraph.value) {
      graph.value.fromJSON(project.value.graph);
    }
    // graph.value.on("change:position", saveGraph);
  });
}
const jsonGraph = computed(() => {
  if (!graph.value) return null;
  return graph.value.toJSON();
})
const initializeJointJsGraph = () => {
  paper.value = new joint.dia.Paper({
    el: graphContainer.value,
    width: "calc(100%)",
    height: "calc(100%)",
    model: graph.value,
    frozen: true,
    async: true,
    cellViewNamespace: namespace,
    defaultConnectionPoint: { name: "rectangle" },
    background: { color: "#F3F7F6" },
    moveThreshold: 5,
    linkPinning: false,
    markAvailable: true,
    preventDefaultBlankAction: false,
    restrictTranslate: function (elementView) {
      const element = elementView.model;
      const padding = element.isEmbedded() ? 20 : 10;
      return {
        x: padding,
        y: padding,
        width: this.getComputedSize().width - 2 * padding,
        height: this.getComputedSize().height - 2 * padding,
      };
    },
    interactive: function (cellView) {
      const cell = cellView.model;
      return cell.isLink() ? { linkMove: false, labelMove: false } : true;
    },
    defaultLink: function (sourceView) {
      const type = sourceView.model.get("type");
      switch (type) {
        case "sd.Message": {
          return new sd.LifeSpan();
        }
        case "sd.Lifeline": {
          return new sd.Message();
        }
      }
      throw new Error("Unknown link type.");
    },
    connectionStrategy: function (
      end,
      cellView,
      magnet,
      p,
      link,
      endType,
      paper
    ) {
      const type = link.get("type");
      switch (type) {
        case "sd.LifeSpan": {
          if (endType === "source") {
            end.anchor = { name: "connectionRatio", args: { ratio: 1 } };
          } else {
            end.anchor = { name: "connectionRatio", args: { ratio: 0 } };
          }
          return end;
        }
        case "sd.Message": {
          if (endType === "source") {
            return joint.connectionStrategies.pinAbsolute.call(
              paper,
              end,
              cellView,
              magnet,
              p,
              link,
              endType,
              paper
            );
          } else {
            end.anchor = { name: "connectionPerpendicular" };
            return end;
          }
        }
      }
    },
    validateConnection: function (
      cellViewS,
      magnetS,
      cellViewT,
      magnetT,
      end,
      linkView
    ) {
      if (cellViewS === cellViewT) return false;
      const type = linkView.model.get("type");
      const targetType = cellViewT.model.get("type");
      switch (type) {
        case "sd.Message": {
          return targetType === "sd.Lifeline";
        }
        case "sd.LifeSpan": {
          if (targetType !== "sd.Message") return false;
          if (cellViewT.model.source().id !== cellViewS.model.target().id)
            return false;
          return true;
        }
      }
    },
    highlighting: {
      connecting: {
        name: "addClass",
        options: {
          className: "highlighted-connecting",
        },
      },
    },
  });

  initializeSequenceDiagram(paper.value, graph.value);
  paper.value.on("blank:contextmenu", handleContextMenu);
  paper.value.on("blank:pointerdown", handleBlankPointerDown);
  paper.value.on("element:pointerdown", handleElementPointerDown);
  paper.value.on("element:pointerclick", handleElementPointerClick);
  paper.value.on("element:pointerup", handleElementPointerUp);

  graph.value.on("remove", handleCellRemovedEvent);
};

const handleContextMenu = (evt, x, y) => {
  console.log("Right click");
};

const handleElementPointerDown = (elementView, evt, x, y) => {
  isChangingGraph.value = true;
};

const handleElementPointerClick = (elementView, evt, x, y) => {
  isChangingGraph.value = true;
  if (selectedCell.value) {
    joint.highlighters.mask.remove(selectedCell.value.findView(paper.value));
  }
  selectedCell.value = elementView.model;
  cellData.value = {
    id: selectedCell.value.id,
    label: selectedCell.value.attr("label/text"),
  };

  joint.highlighters.mask.add(
    elementView,
    { selector: "root" },
    "my-element-highlight",
    {
      deep: true,
      attrs: {
        stroke: "#78cdf5",
        "stroke-width": 3,
      },
    }
  );
};

const handleElementPointerUp = () => {
  isChangingGraph.value = false;
  saveGraph();
};

const handleBlankPointerDown = (evt, x, y) => {
  if (selectedCell.value) {
    joint.highlighters.mask.remove(selectedCell.value.findView(paper.value));
  }
  cellData.value = {};
  selectedCell.value = null;
};

const handleCellRemovedEvent = (cell) => {
  saveGraph();
  if (selectedCell.value === cell) {
    selectedCell.value = null;
    cellData.value = {};
  }
};

function addNewShape(shape) {
  const newShape = createNewShape(shape, paper.value.getComputedSize());
  newShape.addTo(graph.value);
  addElementView(newShape);
}

function addNewLink(link) {
  const newShape = createNewLink(link, paper.value.getComputedSize());
  newShape.addTo(graph.value);
  addLinkView(newShape);
}

const addLinkView = (link) => {
  // const linkView = link.findView(paper.value);
  // const segmentsTool = new joint.linkTools.Segments();
  // const verticesTool = new joint.linkTools.Vertices();
  // const sourceArrowheadTool = new joint.linkTools.SourceArrowhead();
  // const targetArrowheadTool = new joint.linkTools.TargetArrowhead();
  // const sourceAnchorTool = new joint.linkTools.SourceAnchor();
  // const targetAnchorTool = new joint.linkTools.TargetAnchor();
  // const toolsView = new joint.dia.ToolsView({
  //   tools: [
  //     verticesTool,
  //     segmentsTool,
  //     sourceArrowheadTool,
  //     targetArrowheadTool,
  //     sourceAnchorTool,
  //     targetAnchorTool,
  //   ],
  // });
  // linkView.addTools(toolsView);
};

const addElementView = (element) => {
  const elementView = element.findView(paper.value);
};

const saveProject = () => {
  set(projectRef, project.value);
};

const createRoomCode = () => {
  isCreatingRoomCode.value = true;
  const newRoomCodeRef = push(ref(db, "projects/" + projectKey + "/roomCode"));
  newRoomCodeRef
    .then(() => {
      console.log("Room code created", newRoomCodeRef.key);
      set(ref(db, "projects/" + projectKey + "/roomCode"), newRoomCodeRef.key);
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      isCreatingRoomCode.value = false;
    });
};

const deleteSelectedCell = () => {
  if (selectedCell.value) {
    selectedCell.value.remove();
    selectedCell.value = null;
    cellData.value = {};
  }
};

const listenForMessages = () => {
  const messagesRef = ref(db, "messages/" + projectKey);
  return onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const messagesData = snapshot.val();
      messages.value = messagesData;
    }
  });
};

listenForMessages();

const sendMessage = () => {
  if (message.value === "") return;
  const newMessageRef = push(ref(db, "messages/" + projectKey));
  set(newMessageRef, {
    message: message.value,
    userUid: props.user.uid,
    name: props.user.displayName,
    createdAt: new Date().getTime(),
  });
  message.value = "";
};

watch(
  () => cellData.value.label,
  (data) => {
    if (selectedCell.value) {
      selectedCell.value.attr("label/text", data);
    }
  }
);
</script>

<template>
  <ProjectControls
    @saveProject="saveProject"
    @createRoomCode="createRoomCode"
    :isCreatingRoomCode="isCreatingRoomCode"
    :project="project"
  />

  <div
    class="mx-4 p-4 absolute bg-white z-10 top-1/2 -translate-y-1/2 rounded border border-slate-400"
  >
    <div class="flex gap-x-4 items-center">
      <div>
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
      <div>
        <input
          type="text"
          class="px-2 py-1 rounded border-slate-400 focus:outline-none focus:ring focus:ring-slate-300"
          name="search_shapes"
          id="search_shapes"
          placeholder="Search shapes..."
        />
      </div>
    </div>
    <div class="mt-4">
      <div>
        <div>
          <button type="button">
            <i class="fa-solid fa-caret-right mr-2"></i>
            <h4 class="inline">Standard Shapes</h4>
          </button>
        </div>
        <div class="grid grid-cols-4 gap-2 pt-2">
          <ShapeButton @click="addNewShape('circle')">
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="15" stroke="black" fill="none" />
            </svg>
          </ShapeButton>
          <ShapeButton @click="addNewShape('rectangle')">
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="5"
                y="5"
                width="28"
                height="28"
                stroke="black"
                fill="none"
              />
            </svg>
          </ShapeButton>
          <ShapeButton @click="addNewLink('link')">
            <svg height="40" width="40" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="30" x2="35" y2="5" stroke="black" />
            </svg>
          </ShapeButton>
          <ShapeButton @click="addNewShape('actor')">
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="8" r="5" stroke="black" fill="none" />
              <line x1="16" y1="13" x2="16" y2="26" stroke="black" />
              <line x1="11" y1="20" x2="21" y2="20" stroke="black" />
              <line x1="16" y1="26" x2="11" y2="32" stroke="black" />
              <line x1="16" y1="26" x2="21" y2="32" stroke="black" />
            </svg>
          </ShapeButton>
          <ShapeButton @click="addNewShape('object')">
            <svg height="32" width="40" xmlns="http://www.w3.org/2000/svg">
              <polygon
                points="2,2 38,2 38,30 2,30"
                style="fill: none; stroke: black; stroke-width: 1"
              />
              <text x="5" y="18" fill="black" font-size="10">Object</text>
            </svg>
          </ShapeButton>
          <ShapeButton @click="addNewShape('activationBox')">
            <svg height="32" width="32" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="13"
                y="4"
                width="6"
                height="28"
                stroke="black"
                fill="none"
              />
            </svg>
          </ShapeButton>
          <ShapeButton @click="addNewShape('alternativeBox')">
            <svg height="32" width="40" xmlns="http://www.w3.org/2000/svg">
              <polygon
                points="2,2 38,2 38,30 2,30 2,2"
                style="fill: none; stroke: black; stroke-width: 1"
              />
              <line x1="2" y1="10" x2="16" y2="10" stroke="black" />
              <line x1="16" y1="10" x2="20" y2="8" stroke="black" />
              <line x1="20" y1="8" x2="20" y2="2" stroke="black" />
              <text x="6" y="8" fill="black" font-size="6">Alt</text>
            </svg>
          </ShapeButton>
        </div>
      </div>
    </div>
  </div>

  <div
    class="mx-4 p-4 absolute w-1/4 h-[500px] max-w-96 min-w-80 bg-white z-10 top-1/4 -translate-y-1/4 right-4 rounded border border-slate-400"
  >
    <div class="flex justify-between">
      <h3>Side bar</h3>
      <button type="button">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="border rounded-lg mt-4">
      <FwbTabs v-model="activeTab" class="p-5">
        <FwbTab name="first" title="Shapes tools">
          <div
            v-if="!selectedCell"
            class="text-slate-400 bg-slate-100 py-4 text-center"
          >
            Seleccione un elemento
          </div>
          <div v-else class="p-4 bg-slate-100">
            <div>
              <label for="shapeLabel">Label</label>
              <input
                v-model="cellData.label"
                class="w-full border border-slate-400 rounded p-2 mt-2"
                type="text"
                name="shapeLabel"
                id="shapeLabel"
                autocomplete="off"
              />
            </div>
            <div class="mt-4 flex justify-end">
              <button
                @click="deleteSelectedCell"
                type="button"
                class="text-red-500 text-sm bg-red-200 px-4 py-2 border border-red-500 rounded"
              >
                <i class="fa-solid fa-trash mr-2 fa-sm"></i>
                Eliminar
              </button>
            </div>
          </div>
        </FwbTab>
        <FwbTab name="second" title="Chat">
          <div class="flex flex-col gap-4 h-80 justify-between">
            <div
              v-if="Object.keys(messages).length === 0"
              class="text-slate-400 text-center my-auto"
            >
              There are no messages yet
            </div>
            <div v-else class="flex flex-col gap-2 max-h-72 overflow-y-auto">
              <div v-for="(message, key) in messages" :key="key">
                <span class="font-semibold">
                  {{ message.name || "Anonymous" }}:</span
                >
                {{ message.message }}
              </div>
            </div>
            <div>
              <FwbInput
                @keyup.enter="sendMessage"
                v-model="message"
                type="text"
                name="message"
                id="message"
                autocomplete="off"
                placeholder="Message..."
                size="lg"
              >
                <template #suffix>
                  <FwbButton @click="sendMessage">
                    <i class="fa-solid fa-paper-plane"></i>
                  </FwbButton>
                </template>
              </FwbInput>
            </div>
          </div>
        </FwbTab>
      </FwbTabs>
    </div>
  </div>
  <!-- content -->
  <div ref="graphContainer" id="graphContainer"></div>
</template>

<style scoped>
#graphContainer {
  border: 0.5px solid gray;
}

.available-cell.joint-type-sd-message [joint-selector="wrapper"] {
  stroke-width: 26;
}
.available-cell.joint-type-sd-lifeline [joint-selector="wrapper"] {
  stroke-width: 100;
}
.available-cell [joint-selector="line"] {
  stroke: #08bc8a;
  stroke-width: 5;
  stroke-dasharray: none;
}

.available-cell.highlighted-connecting [joint-selector="wrapper"] {
  stroke: #08bc8a;
  stroke-opacity: 0.2;
  stroke-linecap: butt;
}

.joint-tool[data-tool-name="hover-connect"] circle {
  fill: #4666e5;
}
</style>
