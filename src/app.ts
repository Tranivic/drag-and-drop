// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

interface ProjectObj {
  title: string;
  description: string;
  peoples: number;
  active: boolean;
}
// Functions
function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// Autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// ProjectInput Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputElement = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input, please try again!');
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const newProject: ProjectObj = {
        title: userInput[0],
        description: userInput[1],
        peoples: userInput[2],
        active: true,
      };
      globalState.pushNewProject(newProject);
      this.clearInputs();
      globalState.renderProjectsOnDOM();
    }
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

// Project list class
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;

  constructor(private type: 'finished' | 'active') {
    this.templateElement = document.getElementById(
      'project-list'
    )! as HTMLTemplateElement;

    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;
    this.attach();
    this.renderContent(this.type);
  }

  private renderContent(listType: string) {
    const listTitle = listType === 'active' ? 'Active List' : 'Finished List';
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('h2')!.innerHTML = listTitle;
    this.element.querySelector('ul')!.id = listId;
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}

// Global project state (data)
class ProjectState {
  activeProjects: ProjectObj[] = [];
  finishedProjects: ProjectObj[] = [];
  private static instance: ProjectState;

  constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  public pushNewProject(project: ProjectObj) {
    if (project.active) {
      this.activeProjects.push(project);
      console.log(this.activeProjects);
    } else {
      this.finishedProjects.push(project);
      console.log(this.finishedProjects);
    }
  }

  public renderProjectsOnDOM() {
    const finishedListElement = finishedList.element;
    const activeListElement = activeList.element;
    
    activeListElement.innerHTML = '';
    finishedListElement.innerHTML = '';
  
    this.activeProjects.forEach((element) => {
      activeListElement.insertAdjacentHTML('beforeend', `<li id="${element.title}">${element.title}</li>`);
    });
  
    this.finishedProjects.forEach((element) => {
      finishedListElement.insertAdjacentHTML('beforeend', `<li id="${element.title}">${element.title}</li>`);
    });
  }
}

const globalState = ProjectState.getInstance();

// Configurations
const prjInput = new ProjectInput();
const activeList = new ProjectList('active');
const finishedList = new ProjectList('finished');
