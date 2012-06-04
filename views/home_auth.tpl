<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Welcome to notebook</title>
    <link href="static/css/bootstrap.css" rel="stylesheet">
    <link href="static/css/styles.css" rel="stylesheet">
    <link rel="shortcut icon" href="static/favicon.ico">
</head>
<body>
  <div class="header">
    <div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container-fluid">
         <!--  <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a> -->
          <a class="brand" href="#">Notebook</a>
          <div class="nav-collapse">
            <div class="btn-group pull-right">
              <a class="btn dropdown-toggle btn-inverse" data-toggle="dropdown" href="#">
                <i class="icon-user icon-white"></i>
                <span id="user_name">...</span>
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu">
                <li><a href="#">Profile</a></li>
                <li><a href="/logout">Выход</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>    
  </div>
  <div class="container-fluid">
    <div class="row-fluid">
      <div class="span3">
        <div class="well sidebar-nav" id="nav_sidebar">
          <ul class="nav nav-list">
            <li class="nav-header">
              Блокноты
            </li>
            <!-- <li><a href="#" id="create-notebook">Создать блокнот</a></li>
            <li class="divider"></li> -->
          </ul>
          <ul class="nav nav-list" id="notebook-list"></ul>
          <ul class="nav nav-list">
            <li class="divider"></li>
            <li><input type="text" id="new-notebook-name" class="input" style="display:none;"></li>
            <!-- <button id="btn-create-ntb" class="btn add-on">OK</button> -->
            <li><a href="#" id="create-notebook">Создать блокнот</a></li>
          </ul>
        </div><!--/.well -->
      </div><!--/span-->
      <div class="span9">
        <div class="row-fluid">
          <div class="well" id="tools">
            <button class="btn" id="create-new-note">Новая запись</button>
            <button class="btn" id="show-notebook-settings" href="#">
              Настройки блокнота
            </button>
            <strong id="current-notebook-name" class="pull-right">...</strong>
          </div>
          <div class="" id="notes">        
          </div>
        </div>
      </div><!--/span-->
    </div><!--/row-->
  </div><!--/.fluid-container-->
  <div class="modal" id="notebook-settings" style="display:none;"></div>

  <script src="static/lib/jquery.js"></script>
  <script src="static/lib/bootstrap.js"></script>
  <script src="static/lib/underscore.js"></script>
  <script src="static/lib/backbone.js"></script>
  <script src="static/lib/backbone-relational.js"></script>

  <script src="static/js/notebookapp.js"></script>
  <script type="text/javascript">
    NoteApp.bootstrap();
  </script>
</body>
</html>