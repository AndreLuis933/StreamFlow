import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  getDoc,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase-config";

interface FavoriteAnime {
  id: string;
  title: string;
  addedAt: Timestamp;
  slug: string;
  favorito: boolean;
}
export const saveFavorite = async (
  userId: string,
  id: string,
  title: string,
  slug: string,
  favorito: boolean
) => {
  try {
    // Path: users -> {userId} -> favorites -> {slug}
    const favoriteRef = doc(db, "users", userId, "favorites", id);

    const data: FavoriteAnime = {
      id,
      title,
      addedAt: Timestamp.now(),
      slug,
      favorito,
    };

    // setDoc with merge: true ensures we update if exists, or create if not
    await setDoc(favoriteRef, data, { merge: true });

    console.log(
      `Favorite "${title}" (${id}) is favorito (${favorito}) saved successfully!`
    );
  } catch (error) {
    console.error("Error saving favorite:", error);
    throw error;
  }
};

export const getFavorites = async (
  userId: string
): Promise<FavoriteAnime[]> => {
  try {
    // Reference to the 'favorites' subcollection
    const favoritesRef = collection(db, "users", userId, "favorites");

    // Create query (filter by favorito == true and order by most recently added)
    // Nota: Isso pode exigir um índice composto no Firestore (favorito + addedAt)
    const q = query(
      favoritesRef,
      where("favorito", "==", true),
      orderBy("addedAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    // Map documents to a simple array
    const favoritesList: FavoriteAnime[] = querySnapshot.docs.map(
      (doc) => doc.data() as FavoriteAnime
    );

    return favoritesList;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }
};

export const isFavorite = async (
  userId: string,
  id: string
): Promise<boolean> => {
  try {
    // Cria a referência direta ao documento específico: users -> {userId} -> favorites -> {id}
    const favoriteRef = doc(db, "users", userId, "favorites", id);

    // Tenta buscar o documento
    const docSnap = await getDoc(favoriteRef);

    // Retorna true APENAS se existir E se a propriedade favorito for true
    if (docSnap.exists()) {
      const data = docSnap.data() as FavoriteAnime;
      return data.favorito === true;
    }

    return false;
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
};

type SegmentDuration = { start_sec: number; end_sec: number };

type FireJobFn = (nome: string, ep: string) => Promise<void>;

export const fetchSegmentDurationFirebase = async (
  nome: string,
  ep: string,
  tipo: string,
  fireJob: FireJobFn
): Promise<SegmentDuration | null> => {
  const docRef = doc(db, "animes", nome, tipo, ep);

  const existingSnap = await getDoc(docRef);

  if (existingSnap.exists()) {
    const data = existingSnap.data() as any;
    if (
      typeof data.start_sec === "number" &&
      typeof data.end_sec === "number"
    ) {
      return {
        start_sec: data.start_sec,
        end_sec: data.end_sec,
      };
    }
  }

  await fireJob(nome, ep);

  return new Promise<SegmentDuration | null>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(new Error(`Timeout ao consultar por ${tipo}`));
    }, 60_000);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          return;
        }

        const data = docSnap.data() as any;

        if (
          typeof data.start_sec === "number" &&
          typeof data.end_sec === "number"
        ) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve({
            start_sec: data.start_sec,
            end_sec: data.end_sec,
          });
        } else {
          clearTimeout(timeoutId);
          unsubscribe();
          reject(
            new Error(
              "Documento no Firestore não tem start_sec/end_sec válidos"
            )
          );
        }
      },
      (error) => {
        clearTimeout(timeoutId);
        unsubscribe();
        reject(error);
      }
    );
  });
};
