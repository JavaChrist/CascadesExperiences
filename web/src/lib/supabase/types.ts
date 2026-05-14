/**
 * Types Supabase générés à la main pour notre schéma actuel.
 *
 * À terme, on peut générer automatiquement via :
 *   npx supabase gen types typescript --project-id <ID> > web/src/lib/supabase/types.ts
 * (nécessite la CLI Supabase et un access token).
 *
 * IMPORTANT : la forme du type `Database` doit matcher exactement ce que
 * @supabase/supabase-js attend (Tables/Views/Functions/Enums/CompositeTypes +
 * Relationships sur chaque table), sinon l'inférence générique se casse et
 * `.insert()` reçoit `never[]` au lieu du vrai type.
 */

export type StageTypeDB =
  | "wheeling"
  | "conduite"
  | "prive"
  | "rando-electrique";

export type SessionRow = {
  id: string; // uuid
  stage: StageTypeDB;
  date: string; // "YYYY-MM-DD"
  location: string;
  spots_left: number;
  capacity: number;
  created_at: string;
  updated_at: string;
};

export type SessionInsert = {
  id?: string;
  stage: StageTypeDB;
  date: string;
  location: string;
  spots_left: number;
  capacity: number;
  created_at?: string;
  updated_at?: string;
};

export type SessionUpdate = Partial<SessionInsert>;

export type ProfileRow = {
  id: string; // uuid (référence à auth.users.id)
  email: string | null;
  role: "user" | "admin";
  full_name: string | null;
  created_at: string;
};

export type ProfileInsert = {
  id: string;
  email?: string | null;
  role?: "user" | "admin";
  full_name?: string | null;
  created_at?: string;
};

export type ProfileUpdate = Partial<ProfileInsert>;

export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: SessionRow;
        Insert: SessionInsert;
        Update: SessionUpdate;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
    };
    Enums: {
      stage_type: StageTypeDB;
    };
    CompositeTypes: Record<string, never>;
  };
};
