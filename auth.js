import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export async function signInWithGoogle() {
  const plugin = window.Capacitor?.Plugins?.FirebaseAuthentication;
  if (!plugin?.signInWithGoogle) {
    throw new Error("Capacitor FirebaseAuthentication plugin is unavailable.");
  }

  const result = await plugin.signInWithGoogle();
  console.log("Native result credential:", JSON.stringify(result?.credential));

  const idToken = result?.credential?.idToken;
  if (!idToken) {
    throw new Error("No idToken returned — cannot sign in to Firebase JS SDK.");
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const firebaseResult = await signInWithCredential(auth, credential);
  console.log("Web layer sign-in success:", firebaseResult?.user?.email);

  return firebaseResult;
}

export async function signInWithApple() {
  const plugin = window.Capacitor?.Plugins?.FirebaseAuthentication;
  if (!plugin?.signInWithApple) {
    throw new Error("FirebaseAuthentication.signInWithApple is unavailable.");
  }

  try {
    // Step 1: Get credentials from native layer with skipNativeAuth
    const result = await plugin.signInWithApple({ skipNativeAuth: true });

    const idToken = result?.credential?.idToken;
    const nonce = result?.credential?.nonce;

    if (!idToken) {
      throw new Error("No idToken returned — cannot sign in to Firebase JS SDK.");
    }

    // Step 2: Sign in on the web layer using the credentials
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: idToken,
      rawNonce: nonce,
    });

    const firebaseResult = await signInWithCredential(auth, credential);
    console.log("Web layer Apple sign-in success:", firebaseResult?.user?.email);

    return firebaseResult;
  } catch (err) {
    console.error("Apple sign-in error:", err);
    throw err;
  }
}

export async function logout() {
  // Just use native FirebaseAuthentication signOut - works for all providers
  const plugin = window.Capacitor?.Plugins?.FirebaseAuthentication;
  if (plugin?.signOut) {
    try { 
      await plugin.signOut(); 
      console.log("Native sign-out successful");
    } catch (e) {
      console.log("Native sign-out error:", e.message);
    }
  }

  // Also sign out from web Firebase
  await signOut(auth);
}

export async function deleteAppleAccount() {
  const plugin = window.Capacitor?.Plugins?.FirebaseAuthentication;
  if (!plugin) {
    throw new Error("FirebaseAuthentication plugin unavailable.");
  }

  // Step 1: Re-authenticate with Apple to get fresh credentials
  try {
    const result = await plugin.signInWithApple();
    console.log("Re-authenticated with Apple for deletion");
  } catch (err) {
    throw new Error("Re-authentication failed: " + err.message);
  }

  // Step 2: Revoke the Apple access token
  try {
    await plugin.revokeAccessToken();
    console.log("Apple access token revoked");
  } catch (err) {
    console.warn("Token revocation failed (non-fatal):", err.message);
  }

  // Step 3: Delete the Firebase user account
  try {
    await plugin.deleteUser();
    console.log("Firebase user deleted");
  } catch (err) {
    throw new Error("Account deletion failed: " + err.message);
  }

  // Also sign out from web Firebase
  await signOut(auth);
}