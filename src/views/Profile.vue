<template>
  <h1 class="font-bold text-2xl">User profile</h1>

  <div class="mt-8">
    <div class="flex-1 flex flex-col gap-6">
      <div>
        <FwbInput placeholder="Email" label="Email" v-model="userData.email" disabled />
      </div>

      <div>
        <FwbInput placeholder="Username" label="Username" v-model="userData.displayName" />
      </div>

      <div>
        <FwbInput
          placeholder="Photo url"
          label="Photo url"
          v-model="userData.photoURL"
        />
      </div>

      <div>
        <FwbInput
          placeholder="0000000000"
          type="number"
          label="Phone number"
          v-model="userData.phoneNumber"
        />
      </div>

      <div>
        <h3 class="font-semibold text-sm mb-2">Profile picture</h3>
        <FwbFileInput v-model="file" label="Profile picture" dropzone />
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-4">
      <RouterLink :to="{ name: 'home' }">
        <FwbButton color="light">Cancel</FwbButton>
      </RouterLink>
      <FwbButton @click="updateUserProfile" :loading="isUpdatingProfile" :disabled="isUpdatingProfile">Update profile</FwbButton>
    </div>
  </div>

  <FwbToast
    v-if="showSuccessToast"
    class="fixed top-5 right-5"
    type="success"
    closable
    >Profile updated successfully</FwbToast
  >
</template>

<script setup>
import { FwbInput, FwbFileInput, FwbButton, FwbToast } from "flowbite-vue";
import { getAuth, updateProfile } from "firebase/auth";
import { ref } from "vue";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const auth = getAuth();
const userData = ref({
  displayName: props.user.displayName,
  phoneNumber: props.user.phoneNumber,
  photoURL: props.user.photoURL,
  email: props.user.email,
  uid: props.user.uid,
});
const file = ref(null);
const isUpdatingProfile = ref(false);
const showSuccessToast = ref(false);

const updateUserProfile = () => {
  isUpdatingProfile.value = true;
  updateProfile(auth.currentUser, {
    ...userData.value,
  })
    .then(() => {
      showSuccessToast.value = true;
      setTimeout(() => {
        showSuccessToast.value = false;
      }, 5000);
    })
    .catch((error) => {
      console.error("Error updating profile: ", error);
    })
    .finally(() => {
      isUpdatingProfile.value = false;
    });
};
</script>
