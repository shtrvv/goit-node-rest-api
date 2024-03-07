import Contact from "../models/contact.js";

export function listContacts(query, params) {
  return Contact.find(query).skip(params.skip).limit(params.limit);
}

export function getContactById(contactId) {
  return Contact.findById(contactId);
}

export function removeContact(contactId) {
  return Contact.findByIdAndDelete(contactId);
}

export function addContact(body) {
  return Contact.create(body);
}

export function updateContact(contactId, body) {
  return Contact.findByIdAndUpdate(contactId, body, {
    new: true,
  });
}

export function updateStatusContact(contactId, body) {
  return Contact.findByIdAndUpdate(contactId, body, {
    new: true,
  });
}
