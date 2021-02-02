// Named export - has a name, Have as many as needed.
const message = "Some message from namedExport.js";
const name = "rabin";
const location = "bhaktapur";

const getGreeting = (name) => {
  return `Welcome to the graphql ${name}`;
};

export { message, name, getGreeting, location as default };
