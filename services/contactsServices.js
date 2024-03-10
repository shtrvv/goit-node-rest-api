import Contact from "../models/contact.js";

export function listContacts(query, params) {
  return Contact.find(query).skip(params.skip).limit(params.limit);
}

export function findOneContact(filter) {
  return Contact.findOne(filter);
}

export function deleteOneContact(filter) {
  return Contact.findOneAndDelete(filter);
}

export function addContact(body) {
  return Contact.create(body);
}

export function updateOneContact(filter, body) {
  return Contact.findOneAndUpdate(filter, body, {
    new: true,
  });
}
