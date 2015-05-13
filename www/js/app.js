angular.module('todo', ['ionic'])

    .factory('Projects', function() {
      return {
        // Returns a list of all projects from local storage
        all: function() {
          var projectString = window.localStorage['projects'];
          if(projectString) {
            return angular.fromJson(projectString);
          }
          return [];
        },

        // Saves all projects to local storage
        save: function(projects) {
          window.localStorage['projects'] = angular.toJson(projects);
        },

        // Creates a new project to be saved
        newProject: function(projectTitle) {
          return {
            title: projectTitle,
            tasks: []
          };
        },

        // Allows us to maintain state for which project we are on
        getLastActiveIndex: function() {
          return parseInt(window.localStorage['lastActiveProject']) || 0;
        },

        // Allows us to set state for which project we are on
        setLastActiveIndex: function(index) {
          window.localStorage['lastActiveProject'] = index;
        }
      }
    })

.controller('TodoCtrl', function($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate) {
      // Build a new project and push it to our projects array
      var createProject = function(projectTitle) {
        var newProject = Projects.newProject(projectTitle);
        $scope.projects.push(newProject);
        Projects.save($scope.projects);
        $scope.selectProject(newProject, $scope.projects.length-1);
      };

      // Create our initial projects collection from our Projects service
      $scope.projects = Projects.all();

      // Set the active project from local storage
      $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

      // Helper function to create a new project.
      $scope.newProject = function() {
        var projectTitle = prompt('Project name');
        if(projectTitle) {
          createProject(projectTitle);
        }
      };

      // Helper function to select the current project
      $scope.selectProject = function(project, index) {
        $scope.activeProject = project;
        Projects.setLastActiveIndex(index);
        $ionicSideMenuDelegate.toggleLeft(false);
      };

      // Loads our modal template into scope
      $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
        $scope.taskModal = modal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });

      // Create new task model from our modal
      $scope.createTask = function(task) {
        if(!$scope.activeProject || !task) {
          return;
        }

        // Push our new task to our current project
        $scope.activeProject.tasks.push({
          title: task.title
        });

        // Hide the task modal
        $scope.taskModal.hide();

        // Save to our Projects service
        Projects.save($scope.projects);

        task.title = "";
      };

      // Open our task modal
      $scope.newTask = function() {
        $scope.taskModal.show();
      };

      // Close our task modal
      $scope.closeNewTask = function() {
        $scope.taskModal.hide();
      };

      // Toggle our side menu
      $scope.toggleProjects = function() {
        $ionicSideMenuDelegate.toggleLeft()
      }

      // $timeout is set up to where we must create an initial project
      // before the application continues to run.  This ensure proper functionality
      // of the rest of the code
      $timeout(function() {
        if($scope.projects.length == 0) {
          while(true) {
            var projectTitle = prompt('Your first project title:');
            if(projectTitle) {
              createProject(projectTitle);
              break;
            }
          }
        }
      })
    });