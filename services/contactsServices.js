import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";

const contactsPath = path.resolve("db", "contacts.json");

export async function listContacts() {
  const contacts = await fs.readFile(contactsPath, { encoding: "utf-8" });

  return JSON.parse(contacts);
}

export async function getContactById(contactId) {
  const contacts = await listContacts();

  const contact = contacts.find((item) => item.id === contactId);

  if (!contact) {
    return null;
  }

  return contact;
}

export async function removeContact(contactId) {
  const contacts = await listContacts();

  const index = contacts.findIndex((item) => item.id === contactId);
  const removedContact = contacts[index];

  if (index === -1) {
    return null;
  }

  contacts.splice(index, 1);

  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return removedContact;
}

export async function addContact(body) {
  const contacts = await listContacts();

  const newContact = { id: nanoid(), ...body };
  contacts.push(newContact);

  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return newContact;
}

export async function updateContact(contactId, body) {
  const contacts = await listContacts();

  const index = contacts.findIndex((item) => item.id === contactId);

  if (index === -1) {
    return null;
  }

  contacts[index] = { ...contacts[index], ...body };

  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return contacts[index];
}
