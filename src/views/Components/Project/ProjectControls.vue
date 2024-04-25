<script setup>
import { ref } from "vue";
import {
  FwbButton,
  FwbModal,
  FwbSpinner,
  FwbInput,
  FwbDropdown,
  FwbListGroup,
  FwbListGroupItem,
  FwbRadio,
  FwbTextarea,
} from "flowbite-vue";

defineEmits(["saveProject", "createRoomCode", "toggleSideBar"]);

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  isCreatingRoomCode: {
    type: Boolean,
    default: false,
  },
  jsonGraph: {
    type: Object,
    required: true,
  },
  activeUsers: {
    type: Object,
    required: true,
  },
});

const isShowModal = ref(false);
const isShowCodeGeneratorModal = ref(false);
const lenguage = ref("php");
const generatedCode = ref("");

function closeModal() {
  isShowModal.value = false;
}

function showModal() {
  isShowModal.value = true;
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Contenido copiado al portapapeles");
  } catch (err) {
    console.error("Error al copiar: ", err);
  }
};

const getSymbolsPerTypeFromJson = (type) => {
  const cells = props.jsonGraph.cells;
  return cells.filter((cell) => cell.type === type);
};

const generatePHPCode = () => {
  let code = `<?php\n\n`;
  const objects = getSymbolsPerTypeFromJson("sd.Role"); // objects
  const lifelines = getSymbolsPerTypeFromJson("sd.Lifeline");
  const messages = getSymbolsPerTypeFromJson("sd.Message");
  const filteredLifelines = lifelines.filter((lifeline) => {
    return objects.some((object) => {
      return object.embeds.some((embed) => embed === lifeline.id);
    });
  });
  const filteredMessages = messages.filter((message) => {
    return filteredLifelines.some(
      (lifeline) =>
        lifeline.id === message.source.id || lifeline.id === message.target.id
    );
  });
  objects.forEach((object) => {
    code += `class ${object.attrs.label.text} {\n`;
    const objectLifeline = filteredLifelines.find(
      (lifeline) => lifeline.id === object.embeds[0]
    );
    filteredMessages.forEach((message) => {
      // testin

      // end testing
      if (message.target.id === objectLifeline.id) {
        const sourceLifeline = lifelines.find(
          (lifeline) => lifeline.id === message.source.id
        );
        if (sourceLifeline.target.x < objectLifeline.target.x) {
          code += `  public function ${message.labels[0].attrs.labelText.text} {\n    // Your code\n`;
          filteredMessages.forEach((filteredMessage) => {
            if (filteredMessage.source.id === objectLifeline.id) {
              const targetLifeline = lifelines.find(
                (lifeline) => lifeline.id === filteredMessage.target.id
              );
              const objectTarget = objects.find(
                (object) => object.id === targetLifeline.source.id
              );
              if (targetLifeline.target.x > objectLifeline.target.x) {
                code += `  \$${camelize(objectTarget.attrs.label.text)} = new ${
                  objectTarget.attrs.label.text
                }();\n\n`;
              }
            }
          });
          code += `   }\n\n`;
        }
      }
    });
    code += `}\n\n`;
  });
  return code;
};

function camelize(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

const generateJavaCode = () => {
  let code = ``;
  const objects = getSymbolsPerTypeFromJson("sd.Role"); // objects
  const lifelines = getSymbolsPerTypeFromJson("sd.Lifeline");
  const messages = getSymbolsPerTypeFromJson("sd.Message");
  const filteredLifelines = lifelines.filter((lifeline) => {
    return objects.some((object) => {
      return object.embeds.some((embed) => embed === lifeline.id);
    });
  });
  const filteredMessages = messages.filter((message) => {
    return filteredLifelines.some(
      (lifeline) =>
        lifeline.id === message.source.id || lifeline.id === message.target.id
    );
  });
  objects.forEach((object) => {
    code += `public class ${object.attrs.label.text} {\n`;
    const objectLifeline = filteredLifelines.find(
      (lifeline) => lifeline.id === object.embeds[0]
    );
    filteredMessages.forEach((message) => {
      if (message.source.id === objectLifeline.id) {
        const targetLifeline = lifelines.find(
          (lifeline) => lifeline.id === message.target.id
        );
        const objectTarget = objects.find(
          (object) => object.id === targetLifeline.source.id
        );
        if (targetLifeline.target.x > objectLifeline.target.x) {
          code += `  ${objectTarget.attrs.label.text} ${camelize(
            objectTarget.attrs.label.text
          )} = new ${objectTarget.attrs.label.text}();\n\n`;
        }
      }
      if (message.target.id === objectLifeline.id) {
        const sourceLifeline = lifelines.find(
          (lifeline) => lifeline.id === message.source.id
        );
        if (sourceLifeline.target.x < objectLifeline.target.x) {
          code += `  public void ${message.labels[0].attrs.labelText.text} {\n    // Your code\n  }\n\n`;
        }
      }
    });
    code += `}\n\n`;
  });
  return code;
};

const generateCCode = () => {
  let code = ``;
  const objects = getSymbolsPerTypeFromJson("sd.Role"); // objects
  const lifelines = getSymbolsPerTypeFromJson("sd.Lifeline");
  const messages = getSymbolsPerTypeFromJson("sd.Message");
  const filteredLifelines = lifelines.filter((lifeline) => {
    return objects.some((object) => {
      return object.embeds.some((embed) => embed === lifeline.id);
    });
  });
  const filteredMessages = messages.filter((message) => {
    return filteredLifelines.some(
      (lifeline) =>
        lifeline.id === message.source.id || lifeline.id === message.target.id
    );
  });
  objects.forEach((object) => {
    code += `class ${object.attrs.label.text} {\npublic:\n`;
    const objectLifeline = filteredLifelines.find(
      (lifeline) => lifeline.id === object.embeds[0]
    );
    filteredMessages.forEach((message) => {
      if (message.source.id === objectLifeline.id) {
        const targetLifeline = lifelines.find(
          (lifeline) => lifeline.id === message.target.id
        );
        const objectTarget = objects.find(
          (object) => object.id === targetLifeline.source.id
        );
        if (targetLifeline.target.x > objectLifeline.target.x) {
          code += `  ${objectTarget.attrs.label.text} ${camelize(
            objectTarget.attrs.label.text
          )};\n\n`;
        }
      }
      if (message.target.id === objectLifeline.id) {
        const sourceLifeline = lifelines.find(
          (lifeline) => lifeline.id === message.source.id
        );
        if (sourceLifeline.target.x < objectLifeline.target.x) {
          code += `  void ${message.labels[0].attrs.labelText.text} {\n    // Your code\n  }\n\n`;
        }
      }
    });
    code += `};\n\n`;
  });
  return code;
};

const generateCode = () => {
  switch (lenguage.value) {
    case "php":
      generatedCode.value = generatePHPCode();
      break;
    case "Java":
      generatedCode.value = generateJavaCode();
      break;
    case "C++":
      generatedCode.value = generateCCode();
      break;
    default:
      break;
  }
};
</script>

<template>
  <div class="flex gap-x-4 m-4 absolute z-10">
    <div class="bg-white">
      <button type="button">
        <div class="rounded border border-slate-400 px-5 py-2.5">
          <i class="fa-solid fa-bars text-xl"></i>
        </div>
      </button>
    </div>
    <div class="bg-white">
      <ul class="flex gap-x-8 rounded border border-slate-400 px-4 py-2">
        <li>
          <input
            v-model="project.name"
            type="text"
            class="px-2 py-1 bg-slate-100 rounded border-slate-400 focus:outline-none focus:ring focus:ring-slate-300"
            id="proyect-name"
            placeholder="Proyect name"
            autocomplete="off"
          />
        </li>
        <li>
          <button
            @click="$emit('saveProject')"
            type="button"
            class="relative overflow-hidden rounded bg-neutral-950 px-4 py-1 text-white transition-all duration-300 hover:bg-neutral-800 hover:ring-2 hover:ring-neutral-800 hover:ring-offset-2"
          >
            <i class="fa-solid fa-save hidden lg:inline"></i>
            <span class="relative ml-2">Guardar</span>
          </button>
        </li>
        <li>
          <button
            @click="showModal"
            type="button"
            class="relative overflow-hidden rounded bg-neutral-950 px-4 py-1 text-white transition-all duration-300 hover:bg-neutral-800 hover:ring-2 hover:ring-neutral-800 hover:ring-offset-2"
          >
            <i class="fa-solid fa-share hidden lg:inline"></i>
            <span class="relative ml-2">Compartir</span>
          </button>
        </li>
        <li class="flex items-center -space-x-4">
          <img
            v-for="(user, key) in activeUsers"
            :key="key"
            :alt="user.name"
            :src="user.photoUrl"
            class="relative inline-block h-8 w-8 rounded-full border-2 border-white object-cover object-center hover:z-10 focus:z-10 cursor-pointer"
          />
        </li>
        <li>
          <FwbDropdown placement="left" close-inside>
            <template #trigger>
              <button type="button" class="px-2 py-1">
                <i class="fa-solid fa-ellipsis-vertical"></i>
              </button>
            </template>

            <FwbListGroup>
              <FwbListGroupItem @click="isShowCodeGeneratorModal = true" hover>
                Generate code
              </FwbListGroupItem>
              <FwbListGroupItem @click="$emit('toggleSideBar')" hover>
                Show sidebar
              </FwbListGroupItem>
            </FwbListGroup>
          </FwbDropdown>
        </li>
      </ul>
    </div>
  </div>

  <FwbModal v-if="isShowModal" @close="closeModal">
    <template #header>
      <div class="flex items-center text-lg font-semibold">
        Share with your team
      </div>
    </template>
    <template #body>
      <div v-if="isCreatingRoomCode" class="flex justify-center py-4">
        <FwbSpinner size="8" />
      </div>
      <div>
        <p
          v-if="!project.roomCode"
          class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
        >
          Aún no has compartido el proyecto con tu equipo,
          <button
            @click="$emit('createRoomCode')"
            type="button"
            class="font-semibold text-blue-600 dark:text-white hover:underline"
          >
            click aquí
          </button>
          para crear un código de invitación.
        </p>
        <div v-else class="mb-4">
          <div class="my-4">
            <FwbInput
              v-model="project.roomCode"
              label="Room code"
              type="text"
              name="room-code"
              id="room-code"
              autocomplete="off"
              size="lg"
              readonly
            >
              <template #suffix>
                <FwbButton @click="copyToClipboard(project.roomCode)">
                  <i class="fa-solid fa-copy"></i>
                </FwbButton>
              </template>
            </FwbInput>
          </div>
          <div class="font-semibold my-2">Your team</div>
          <div class="border rounded border-slate-400 p-4">
            <div class="p-4 text-center text-gray-400">
              Looks like nobody joined yet, share your room code, your teammates
              will appear here when they join
            </div>
            <!-- <div>First person</div> -->
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <fwb-button @click="closeModal" color="alternative"> Close </fwb-button>
        <!-- <fwb-button @click="closeModal" color="green"> I accept </fwb-button> -->
      </div>
    </template>
  </FwbModal>

  <FwbModal
    v-if="isShowCodeGeneratorModal"
    @close="isShowCodeGeneratorModal = false"
  >
    <template #header>
      <div class="flex items-center text-lg font-semibold">Generate code</div>
    </template>
    <template #body>
      <div>
        <div class="flex">
          <FwbRadio v-model="lenguage" label="PHP" value="php" />
          <FwbRadio v-model="lenguage" label="Java" value="Java" />
          <FwbRadio v-model="lenguage" label="C++" value="C++" />
        </div>
        <FwbTextarea
          v-model="generatedCode"
          placeholder="Your code will appear here"
          label=""
          rows="14"
        >
          <template #footer>
            <div class="flex items-center justify-end gap-2">
              <fwb-button @click="generateCode" type="submit">
                Generate code
              </fwb-button>
              <fwb-button @click="copyToClipboard(generatedCode)" type="submit">
                <i class="fa-solid fa-copy"></i>
              </fwb-button>
            </div>
          </template>
        </FwbTextarea>
      </div>
    </template>
  </FwbModal>
</template>
