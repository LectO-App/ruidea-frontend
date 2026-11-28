const KEY = "ruidea.antesDeEmpezar";

// Storage can be blocked (private modes, strict settings); the screen still works without it,
// the answers just don't survive a reload.
export const loadAnswers = () => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || {};
  } catch (err) {
    return {};
  }
};

export const saveAnswers = (answers) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(answers));
  } catch (err) {
    // Blocked storage: keep the answers in memory only.
  }
};
