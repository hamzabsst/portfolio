// Keep + and # so a C++ search is distinct from C, and split common separators.
function words(value) {
  return value.toLowerCase().match(/[\p{L}\p{N}+#]+/gu) || [];
}

export function matchesProject(project, query, topic = 'all') {
  if (topic !== 'all' && !project.topics.includes(topic)) return false;

  const terms = words(query);
  const searchable = words(project.text);
  return terms.every((term) =>
    searchable.some((word) =>
      term.length === 1 ? word === term : word.startsWith(term),
    ),
  );
}
