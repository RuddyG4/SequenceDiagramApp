<script setup>
import * as joint from "@joint/core";
import { useRoute } from "vue-router";
import { ref as vRef, onMounted, watch, computed, onBeforeUnmount } from "vue";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import ShapesSidebar from "@/views/Components/Project/ShapesSidebar.vue";
import ProjectControls from "./Components/Project/ProjectControls.vue";
import { sd, sequenceDiagramShapes } from "@/assets/JointJs/joint.shapes.sd";
import { createNewShape, createNewLink } from "@/assets/JointJs/Shapes";
import { initializeSequenceDiagram } from "@/assets/JointJs/Sequence";
import { FwbTab, FwbTabs, FwbInput, FwbButton } from "flowbite-vue";

onBeforeUnmount(() => {
  changeUserActiveStatus(null);
});

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
const isSideBarOpen = vRef(true);
const activeUsers = vRef({});

const db = getDatabase();
const projectRef = ref(db, "projects/" + projectKey);

const saveGraph = () => {
  const graphRef = ref(db, "projects/" + projectKey + "/graph");
  set(graphRef, graph.value.toJSON());
};

let stopListeningForProjectChanges = listenForProjectChanges();

const changeUserActiveStatus = (value) => {
  const activeUsersRef = ref(
    db,
    "activeUsers/" + projectKey + "/" + props.user.uid
  );
  set(activeUsersRef, value)
    .then(() => {
      console.log("User active status changed");
    })
    .catch((error) => {
      console.error("Error changing user active status: ", error);
    });
};

const getActiveUsers = () => {
  const activeUsersRef = ref(db, "activeUsers/" + projectKey);
  onValue(activeUsersRef, (snapshot) => {
    if (snapshot.exists()) {
      activeUsers.value = snapshot.val();
    }
  });
};

onMounted(() => {
  initializeJointJsGraph();
  changeUserActiveStatus({
    name: props.user.displayName,
    photoUrl: props.user.photoURL,
  });
  getActiveUsers();
  window.addEventListener("beforeunload", () => {
    changeUserActiveStatus(null);
  });
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
});
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
    width: selectedCell.value.size().width,
    height: selectedCell.value.size().height,
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
  // saveGraph();
  if (selectedCell.value === cell) {
    selectedCell.value = null;
    cellData.value = {};
  }
};

function addNewShape(shape) {
  const newShape = createNewShape(shape, paper.value);
  addElementView(newShape);
}

function addNewLink(link) {
  const newShape = createNewLink(link, paper.value);
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

const toggleSideBar = (value = true) => {
  isSideBarOpen.value = value;
};

const updateSelectedCell = () => {
  if (selectedCell.value) {
    selectedCell.value.resize(cellData.value.width, cellData.value.height);
  }
};
</script>

<template>
  <ProjectControls
    @saveProject="saveProject"
    @createRoomCode="createRoomCode"
    @toggleSideBar="toggleSideBar"
    :isCreatingRoomCode="isCreatingRoomCode"
    :project="project"
    :jsonGraph="jsonGraph"
    :activeUsers="activeUsers"
  />

  <ShapesSidebar @addNewShape="addNewShape" @addNewLink="addNewLink" />

  <div
    v-if="isSideBarOpen"
    class="mx-4 p-4 absolute w-1/4 h-[500px] max-w-96 min-w-80 bg-white z-10 top-1/4 -translate-y-[20%] 2xl:-translate-y-1/4 right-4 rounded border border-slate-400"
  >
    <div class="flex justify-between">
      <h3>Side bar</h3>
      <button @click="toggleSideBar(false)" type="button">
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
                @keyup.enter="updateSelectedCell"
                class="w-full border border-slate-400 rounded p-2 mt-2"
                type="text"
                name="shapeLabel"
                id="shapeLabel"
                autocomplete="off"
              />
            </div>
            <div>
              <label for="shapeWidth">Width</label>
              <input
                v-model="cellData.width"
                @keyup.enter="updateSelectedCell"
                class="w-full border border-slate-400 rounded p-2 mt-2"
                type="number"
                name="shapeWidth"
                id="shapeWidth"
                autocomplete="off"
              />
            </div>
            <div>
              <label for="shapeHeight">Height</label>
              <input
                v-model="cellData.height"
                @keyup.enter="updateSelectedCell"
                class="w-full border border-slate-400 rounded p-2 mt-2"
                type="number"
                name="shapeHeight"
                id="shapeHeight"
                autocomplete="off"
              />
            </div>
            <div class="mt-4 flex justify-end gap-2">
              <button
                @click="deleteSelectedCell"
                type="button"
                class="text-red-500 text-sm bg-red-200 px-4 py-2 border border-red-500 rounded"
              >
                <i class="fa-solid fa-trash mr-2 fa-sm"></i>
                Eliminar
              </button>
              <FwbButton @click="updateSelectedCell"> Save </FwbButton>
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
