<template>
  <!-- component -->
  <div class="bg-gray-100 flex justify-center items-center h-screen">
    <!-- Left: Image -->
    <div class="w-1/2 h-screen hidden lg:block">
      <!-- https://img.freepik.com/premium-psd/graph-diagram-mathematical-profit-business-blue-squared-button-3d-realistic-speech-bubble-icon_92753-11227.jpg?w=740 -->
      <img
        src="https://placehold.co/800x/667fff/ffffff.png?text=Your+Image&font=Montserrat"
        alt="Placeholder Image"
        class="object-cover w-full h-full"
      />
    </div>
    <!-- Right: Login Form -->
    <div class="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
      <h1 class="text-2xl font-semibold mb-4">Login</h1>
      <div class="mt-4 flex flex-col lg:flex-row items-center justify-center">
        <div class="w-full lg:w-1/2 mb-2 lg:mb-0">
          <button
            type="button"
            class="w-full flex justify-center items-center gap-2 bg-white text-sm text-gray-600 p-2 rounded-md hover:bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-300"
            @click="signInWithGoogle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              class="w-4"
              id="google"
            >
              <path
                fill="#fbbb00"
                d="M113.47 309.408 95.648 375.94l-65.139 1.378C11.042 341.211 0 299.9 0 256c0-42.451 10.324-82.483 28.624-117.732h.014L86.63 148.9l25.404 57.644c-5.317 15.501-8.215 32.141-8.215 49.456.002 18.792 3.406 36.797 9.651 53.408z"
              ></path>
              <path
                fill="#518ef8"
                d="M507.527 208.176C510.467 223.662 512 239.655 512 256c0 18.328-1.927 36.206-5.598 53.451-12.462 58.683-45.025 109.925-90.134 146.187l-.014-.014-73.044-3.727-10.338-64.535c29.932-17.554 53.324-45.025 65.646-77.911h-136.89V208.176h245.899z"
              ></path>
              <path
                fill="#28b446"
                d="m416.253 455.624.014.014C372.396 490.901 316.666 512 256 512c-97.491 0-182.252-54.491-225.491-134.681l82.961-67.91c21.619 57.698 77.278 98.771 142.53 98.771 28.047 0 54.323-7.582 76.87-20.818l83.383 68.262z"
              ></path>
              <path
                fill="#f14336"
                d="m419.404 58.936-82.933 67.896C313.136 112.246 285.552 103.82 256 103.82c-66.729 0-123.429 42.957-143.965 102.724l-83.397-68.276h-.014C71.23 56.123 157.06 0 256 0c62.115 0 119.068 22.126 163.404 58.936z"
              ></path>
            </svg>
            Sign Up with Google
          </button>
        </div>
      </div>

      <FwbAlert v-if="alertMessage" class="my-4" icon type="danger">
        {{ alertMessage }}
      </FwbAlert>

      <form @submit.prevent="login" method="POST">
        <!-- Username Input -->
        <div class="mb-4">
          <label for="email" class="block text-gray-600">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
          />
        </div>
        <!-- Password Input -->
        <div class="mb-4">
          <label for="password" class="block text-gray-600">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            autocomplete="off"
          />
        </div>
        <!-- Remember Me Checkbox -->
        <div class="mb-4 flex items-center">
          <input
            type="checkbox"
            id="remember"
            name="remember"
            class="text-blue-500"
          />
          <label for="remember" class="text-gray-600 ml-2">Remember Me</label>
        </div>
        <!-- Forgot Password Link -->
        <div class="mb-6 text-blue-500">
          <a href="#" class="hover:underline">Forgot Password?</a>
        </div>
        <!-- Login Button -->
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
        >
          Login
        </button>
      </form>
      <!-- Sign up  Link -->
      <div class="mt-6 text-blue-500 text-center">
        <RouterLink :to="{ name: 'register' }">
          <span class="hover:underline">Sign up Here</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { FwbAlert } from "flowbite-vue";

const router = useRouter();

const email = ref("");
const password = ref("");
const alertMessage = ref("");

const errorMap = {
  "auth/invalid-email": "Invalid email",
  "auth/wrong-password": "Wrong password",
  "auth/user-not-found": "User not found",
  "auth/missing-password": "Missing password",
  "auth/invalid-credential": "Invalid credentials",
};
const login = () => {
  signInWithEmailAndPassword(getAuth(), email.value, password.value)
    .then((userCredential) => {
      router.push({ name: "home" });
    })
    .catch((error) => {
      alertMessage.value = errorMap[error.code] || "Unknown error";
    });
};

const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(getAuth(), provider)
    .then((result) => {
      // console.log(result.user);
      router.push({ name: "home" });
    })
    .catch((error) => {
      console.log(error);
    });
};
</script>
