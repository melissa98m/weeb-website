import React from "react";
import Select from "../ui/Select";

function AddUserFormationForm({
  userOptions,
  formationOptions,
  addUserId,
  setAddUserId,
  addFormationId,
  setAddFormationId,
  onSubmit,
  busy,
}) {
  return (
    <section className="rounded-2xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">Ajouter un utilisateur à une formation</h2>
      <form className="grid gap-3 sm:grid-cols-3 items-start" onSubmit={onSubmit}>
        <Select
          id="add-user"
          value={addUserId}
          onChange={setAddUserId}
          options={userOptions}
          placeholder="Choisir un utilisateur"
        />
        <Select
          id="add-formation"
          value={addFormationId}
          onChange={setAddFormationId}
          options={formationOptions}
          placeholder="Choisir une formation"
        />
        <button
          type="submit"
          className="rounded-xl border px-4 py-2 disabled:opacity-50"
          disabled={!addUserId || !addFormationId || busy}
          aria-busy={busy ? "true" : "false"}
        >
          {busy ? "Ajout..." : "Ajouter"}
        </button>
      </form>
    </section>
  );
}

export default React.memo(AddUserFormationForm);
