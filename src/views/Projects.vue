<script setup>
import {
  FwbCard,
  FwbButton,
  FwbSpinner,
  FwbModal,
  FwbInput,
} from "flowbite-vue";
import {
  getDatabase,
  child,
  ref as fRef,
  get,
  push,
  set,
  query,
  equalTo,
  orderByChild,
  limitToFirst,
} from "firebase/database";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

// onMounted(() => {
//   window.addEventListener('beforeunload', alert("beforeunload"));
// })

const router = useRouter();
const projects = ref({});
const sharedProjects = ref({});
const loadingData = ref(false);
const isLoadingSharedProjects = ref(false);
const db = getDatabase();
const dbRef = fRef(db);
const isShowModal = ref(false);
const roomCode = ref("");
const isInvalidRoomCode = ref(false);
const isJoiningToSharedProject = ref(false);
const projectShared = ref(null);
const projectSharedKey = ref(null);

function closeModal() {
  isShowModal.value = false;
}

function showModal() {
  isShowModal.value = true;
}

const getProjects = () => {
  loadingData.value = true;
  const projectsData = get(
    query(
      child(dbRef, "projects"),
      orderByChild("userUid"),
      equalTo(props.user.uid)
    )
  );
  projectsData
    .then((snapshot) => {
      if (snapshot.exists()) {
        projects.value = snapshot.val();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      loadingData.value = false;
    });
};

const getSharedProjects = () => {
  isLoadingSharedProjects.value = true;
  const sharedProjectsData = get(fRef(db, "projects"));
  sharedProjectsData
    .then((snapshot) => {
      const projectsData = snapshot.val() || {};
      const sharedProjectsFilter = Object.entries(projectsData)
        .filter(
          ([projectId, projectData]) =>
            projectData.guests && projectData.guests[props.user.uid] === true
        )
        // .map(([projectId, projectData]) => ({ id: projectId, ...projectData }));
      sharedProjects.value = sharedProjectsFilter;
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      isLoadingSharedProjects.value = false;
    });
};

getProjects();
getSharedProjects();

const projectCount = computed(() => {
  if (isObjectEmpty(projects.value)) {
    return 0;
  }
  return Object.keys(projects.value).length;
});

const sharedProjectCount = computed(() => {
  return sharedProjects.value.length;
});

const isObjectEmpty = (objectName) => {
  return (
    objectName &&
    Object.keys(objectName).length === 0 &&
    objectName.constructor === Object
  );
};

const createNewProject = () => {
  const newProjectKey = push(child(fRef(db), "projects")).key;
  set(fRef(db, "projects/" + newProjectKey), {
    name: "Project name",
    userUid: props.user.uid,
    createdAt: new Date().getTime(),
    lastUpdatedAt: new Date().getTime(),
    roomCode: false,
  });
  // redirect to the project page
  router.push({ name: "projects", params: { projectKey: newProjectKey } });
};

const searchProjectbyRoomCode = () => {
  isInvalidRoomCode.value = false;
  const projectSharedData = get(
    query(
      child(dbRef, "projects"),
      orderByChild("roomCode"),
      equalTo(roomCode.value),
      limitToFirst(1)
    )
  );

  projectSharedData
    .then((snapshot) => {
      if (snapshot.exists()) {
        projectSharedKey.value = Object.keys(snapshot.val())[0];
        projectShared.value = snapshot.val()[projectSharedKey.value];
      } else {
        isInvalidRoomCode.value = true;
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const joinToSharedProject = () => {
  isJoiningToSharedProject.value = true;
  const guestAddedPromise = set(
    fRef(db, "projects/" + projectSharedKey.value + "/guests/" + props.user.uid),
    true
  );

  guestAddedPromise
    .then(() => {
      console.log("Guest added");
      projectSharedKey.value = null;
      projectShared.value = null;
      roomCode.value = "";
      closeModal();
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      isJoiningToSharedProject.value = false;
    });
};
</script>

<template>
  <div class="flex justify-between bg-white p-4 rounded shadow-md">
    <h1 class="text-2xl font-semibold">Projects</h1>
    <div>
      <fwb-button @click="createNewProject" color="default">
        Crear nuevo proyecto
      </fwb-button>
    </div>
  </div>

  <div class="bg-white mt-6 p-4 rounded shadow-md">
    <h2 class="text-xl font-semibold">Your projects</h2>
    <div
      v-if="loadingData"
      class="mt-4 p-4 py-8 rounded bg-slate-300 flex justify-center shadow-md"
    >
      <FwbSpinner size="12" />
    </div>
    <div
      v-else
      class="mt-4 p-4 rounded bg-slate-300 grid grid-cols-4 lg:grid-cols-5 gap-4 shadow-md"
    >
      <div
        v-if="projectCount === 0"
        class="col-span-6 p-4 text-center border rounded-lg border-slate-400 hover:border-slate-500"
      >
        <div class="mb-2 text-gray-600">
          Todavía no tienes proyectos, crea uno nuevo
        </div>
        <div>
          <fwb-button @click="createNewProject" color="default">
            Crear proyecto
          </fwb-button>
        </div>
      </div>
      <template v-else>
        <RouterLink
          v-for="(project, projectKey) in projects"
          :to="{ name: 'projects', params: { projectKey: projectKey } }"
          class="border rounded-lg border-slate-400 hover:border-slate-500"
        >
          <fwb-card
            img-alt="Desk"
            img-src="/assets/images/logo.png"
            variant="image"
          >
            <div class="p-2">
              <h5
                class="mb-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-white"
              >
                {{ project.name }}
              </h5>
              <p class="font-normal text-sm text-gray-500 dark:text-gray-400">
                Editado hace 4 días
              </p>
            </div>
          </fwb-card>
        </RouterLink>
      </template>
    </div>
  </div>

  <div class="bg-white mt-6 p-4 rounded shadow-md">
    <div class="flex justify-between">
      <h2 class="text-xl font-semibold">Projects shared with you</h2>
      <fwb-button @click="showModal" color="default">
        Unirse a un proyecto
      </fwb-button>
    </div>

    <div
      v-if="isLoadingSharedProjects"
      class="mt-4 p-4 py-8 rounded bg-slate-300 flex justify-center shadow-md"
    >
      <FwbSpinner size="12" />
    </div>

    <div
      v-else
      class="mt-4 p-4 rounded bg-slate-300 grid grid-cols-4 lg:grid-cols-5 gap-4 shadow-md"
    >
      <div
        v-if="sharedProjectCount === 0"
        class="col-span-6 p-4 text-center border rounded-lg border-slate-400 hover:border-slate-500"
      >
        <div class="mb-2 text-gray-600">
          Todavía no te has unido a ningun proyecto
        </div>
        <div>
          <fwb-button @click="showModal" color="default">
            Unirse a un proyecto
          </fwb-button>
        </div>
      </div>
      <template v-else>
        <RouterLink
          v-for="(project) in sharedProjects"
          :to="{ name: 'projects', params: { projectKey: project[0] } }"
          class="border rounded-lg border-slate-400 hover:border-slate-500"
        >
          <fwb-card
            img-alt="Desk"
            img-src="/assets/images/logo.png"
            variant="image"
          >
            <div class="p-2">
              <h5
                class="mb-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-white"
              >
                {{ project[1].name }}
              </h5>
              <p class="font-normal text-sm text-gray-500 dark:text-gray-400">
                Editado hace 4 días
              </p>
            </div>
          </fwb-card>
        </RouterLink>
      </template>
    </div>
  </div>

  <FwbModal v-if="isShowModal" @close="closeModal">
    <template #header>
      <div class="flex items-center text-lg font-semibold">
        Join with room code
      </div>
    </template>
    <template #body>
      <FwbInput
        v-model="roomCode"
        label="Room code"
        size="lg"
        type="text"
        id="room-code"
        autocomplete="off"
      >
        <template #prefix>
          <svg
            aria-hidden="true"
            class="w-5 h-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        </template>
        <template #suffix>
          <fwb-button @click="searchProjectbyRoomCode" color="green"
            >Search</fwb-button
          >
        </template>
        <template #helper>
          <div v-if="isInvalidRoomCode" class="text-red-500 mt-2">
            The room code entered is incorrect
          </div>
        </template>
      </FwbInput>

      <div
        v-if="projectShared"
        class="my-4 p-5 border border-gray-200 dark:border-gray-100 rounded"
      >
        <div class="mb-2 text-lg font-semibold">Project data</div>
        <div>
          <span class="font-semibold">project name:</span>
          {{ projectShared.name }}
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-4">
        <fwb-button @click="closeModal" color="alternative"> Close </fwb-button>
        <fwb-button
          @click="joinToSharedProject"
          :loading="isJoiningToSharedProject"
          :disabled="!projectShared || isJoiningToSharedProject"
        >
          Join now
        </fwb-button>
      </div>
    </template>
  </FwbModal>
</template>
