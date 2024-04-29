<script setup>
import { FwbButton, FwbModal, FwbInput } from "flowbite-vue";
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import ShowProjects from "@/views/Components/Project/ShowProjects.vue";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const router = useRouter();
const projects = ref({});
const sharedProjects = ref({});
const isLoadingProjects = ref(false);
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
  isLoadingProjects.value = true;
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
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      isLoadingProjects.value = false;
    });
};

const getSharedProjects = () => {
  isLoadingSharedProjects.value = true;
  const sharedProjectsData = get(fRef(db, "projects"));
  sharedProjectsData
    .then((snapshot) => {
      const projectsData = snapshot.val() || {};
      const sharedProjectsFilter = Object.entries(projectsData).filter(
        ([projectId, projectData]) =>
          projectData.guests && projectData.guests[props.user.uid] === true
      );
      // .map(([projectId, projectData]) => ({ id: projectId, ...projectData }));
      sharedProjects.value = Object.fromEntries(sharedProjectsFilter);
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

const createNewProject = () => {
  if (!confirm("¿Quieres crear un nuevo proyecto?")) return;
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
    fRef(
      db,
      "projects/" + projectSharedKey.value + "/guests/" + props.user.uid
    ),
    true
  );

  guestAddedPromise
    .then(() => {
      console.log("Guest added");
      projectSharedKey.value = null;
      projectShared.value = null;
      roomCode.value = "";
      closeModal();
      getSharedProjects();
      //TODO: show success message with toast
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
  <div class="bg-white p-4 rounded shadow-md">
    <h1 class="text-2xl font-semibold">Projects</h1>
  </div>

  <ShowProjects
    :projects="projects"
    :isLoading="isLoadingProjects"
    title="Your projects"
  >
    <template v-slot:headerButton>
      <FwbButton @click="createNewProject"> Create new project </FwbButton>
    </template>
  </ShowProjects>

  <ShowProjects
    :projects="sharedProjects"
    :isLoading="isLoadingSharedProjects"
    title="Shared projects"
  >
    <template v-slot:headerButton>
      <FwbButton @click="showModal"> Join with room code </FwbButton>
    </template>
  </ShowProjects>

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
