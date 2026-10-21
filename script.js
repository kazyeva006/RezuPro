const fields = [
  "fullName", "jobTitle", "email", "phone",
  "location", "summary", "experience",
  "education", "skills", "languages", 
  "certificates", "courses"
];

const initialData = {
  fullName: "Казыева Бурмагүл",
  jobTitle: "Маркетолог",
  email: "kazyeva.burmagul@gmail.com",
  phone: "+996 555 123 456",
  location: "Бишкек, Кыргызстан",
  summary: "Натыйжага багытталган, чыгармачыл адисмин. Команда менен иштөөнү жана жаңы идеяларды өнүктүрүүнү жактырам.",
  experience: "Контент жана маркетинг кампанияларын пландаштыруу.\nСоциалдык тармактарды талдоо.",
  education: "Маркетинг боюнча бакалавр",
  skills: "SMM, Коммуникация, Контент, Аналитика",
  languages: "Кыргызча (эне тили), Русский (эркин), English (B2)",
  certificates: "КВН 1-орун диплом, Ардак грамоталар",
  courses: "SMM & Content Creation Intensive, 2024"
};

const translations = {
  ky: {
    home: "Башкы бет",
    templates: "Шаблондор",
    editor: "Редактор",
    selected: "Шаблон тандалды"
  },
  ru: {
    home: "Главная",
    templates: "Шаблоны",
    editor: "Редактор",
    selected: "Шаблон выбран"
  },
  en: {
    home: "Home",
    templates: "Templates",
    editor: "Editor",
    selected: "Template selected"
  }
};

const $ = id => document.getElementById(id);

let currentLanguage = "ky";
let currentTemplate = "classic";
let photoDataUrl = "";
let toastTimer;

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function getValue(id) {
  return $(id).value.trim();
}

// Автоматтык сактоо (LocalStorage)
function saveData() {
  const dataToSave = {};
  fields.forEach(id => {
    dataToSave[id] = $(id).value;
  });
  dataToSave.themeColor = $("themeColor").value;
  dataToSave.photoDataUrl = photoDataUrl;
  localStorage.setItem("resupro_data_v3", JSON.stringify(dataToSave));
}

// Текшерүү / Прогресс бар
function updateProgress() {
  let filledCount = 0;
  fields.forEach(id => {
    if (getValue(id) !== "") filledCount++;
  });

  const percentage = Math.round((filledCount / fields.length) * 100);
  $("completionPercentage").textContent = percentage + "%";
  $("progressFill").style.width = percentage + "%";
}

function updatePreview() {
  const name = getValue("fullName") || "Аты-жөнү";
  const role = getValue("jobTitle");
  const email = getValue("email");
  const phone = getValue("phone");
  const location = getValue("location");

  $("previewName").textContent = name;
  $("previewRole").textContent = role;
  $("previewContact").textContent = [email, phone, location].filter(Boolean).join(" · ");

  $("previewSummary").textContent = getValue("summary");
  $("previewExperience").textContent = getValue("experience");
  $("previewEducation").textContent = getValue("education");

  // Жөндөмдөр
  const skills = getValue("skills").split(",").map(s => s.trim()).filter(Boolean);
  $("previewSkills").replaceChildren();
  skills.forEach(skill => {
    const item = document.createElement("span");
    item.textContent = skill;
    $("previewSkills").appendChild(item);
  });

  // Кошумча бөлүмдөр
  $("previewLanguages").textContent = getValue("languages");
  $("previewCertificates").textContent = getValue("certificates");
  $("previewCourses").textContent = getValue("courses");

  // Сүрөт
  const photoBox = $("previewPhotoContainer");
  if (photoDataUrl) {
    $("previewPhoto").src = photoDataUrl;
    photoBox.style.display = "block";
  } else {
    photoBox.style.display = "none";
  }

  updateProgress();
  saveData();
}

// Сүрөт жүктөө
$("photoInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      photoDataUrl = evt.target.result;
      updatePreview();
    };
    reader.readAsDataURL(file);
  }
});

// Түстү өзгөртүү
$("themeColor").addEventListener("input", function (e) {
  const color = e.target.value;
  document.documentElement.style.setProperty("--resume-color", color);
  saveData();
});

// Түнкү режимди которуу
$("themeToggleBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  $("themeToggleBtn").textContent = isDark ? "☀️" : "🌙";
});

// Сакталган маалыматтарды жүктөө
function loadSavedData() {
  const saved = localStorage.getItem("resupro_data_v3");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      fields.forEach(id => {
        if (data[id] !== undefined) $(id).value = data[id];
      });
      if (data.themeColor) {
        $("themeColor").value = data.themeColor;
        document.documentElement.style.setProperty("--resume-color", data.themeColor);
      }
      if (data.photoDataUrl) {
        photoDataUrl = data.photoDataUrl;
      }
    } catch (e) {
      console.error("Сакталган маалыматтарды калыбына келтирүүдө ката кетти", e);
    }
  }
}

fields.forEach(id => {
  $(id).addEventListener("input", updatePreview);
});

$("language").addEventListener("change", event => {
  const language = event.target.value;
  currentLanguage = language;
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i]").forEach(element => {
    const key = element.dataset.i;
    if (translations[language] && translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });
});

document.querySelectorAll(".template").forEach(button => {
  button.addEventListener("click", () => {
    currentTemplate = button.dataset.template;

    document.querySelectorAll(".template").forEach(item => {
      item.classList.toggle("selected", item === button);
    });

    const preview = $("resumePreview");
    preview.classList.remove("style-modern", "style-bold", "style-green");

    if (currentTemplate !== "classic") {
      preview.classList.add("style-" + currentTemplate);
    }

    showToast(translations[currentLanguage].selected);
  });
});

// «Резюме түзүү» баскычы
$("createBtn").addEventListener("click", () => {
  updatePreview();
  showToast("Резюме ийгиликтүү түзүлдү!");
  
  // Экранды превью бөлүгүнө жылдыруу
  $("resumePreview").scrollIntoView({ behavior: "smooth", block: "start" });
});

// PDF сактоо
$("downloadBtn").addEventListener("click", () => {
  updatePreview();
  window.print();
});

// Кайра баштоо
$("resetBtn").addEventListener("click", () => {
  fields.forEach(id => {
    $(id).value = initialData[id];
  });
  photoDataUrl = "";
  if ($("photoInput")) $("photoInput").value = "";
  $("themeColor").value = "#7138ef";
  document.documentElement.style.setProperty("--resume-color", "#7138ef");
  localStorage.removeItem("resupro_data_v3");

  updatePreview();
  showToast("Маалыматтар баштапкы абалга келтирилди.");
});

// Ишке киргизүү
loadSavedData();
updatePreview();