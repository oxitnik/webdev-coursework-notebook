<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Notebook:Admin</title>
    <link href="/static/css/bootstrap.css" rel="stylesheet">
    <link href="/static/css/styles.css" rel="stylesheet">
    <link rel="shortcut icon" href="static/favicon.ico">
</head>
<body>
  <div class="header">
    <div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container-fluid">
          <a class="brand" href="#">Notebook:<em>Admin</em></a>
          <div class="nav-collapse">
            <div class="btn-group pull-right">
              <a class="btn dropdown-toggle btn-inverse" data-toggle="dropdown" href="#">
                <i class="icon-user icon-white"></i>
                <span id="user_name">...</span>
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu">
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

      <div class="span2">
        <div class="well sidebar-nav" id="nav_sidebar">
          <ul class="nav nav-list">
            <li class="nav-header">
              Пользователи
            </li>
          </ul>
          <ul class="nav nav-list" id="user-list">
          </ul>
        </div><!--/.well -->
      </div><!--/span-->

      <div class="span2">
        <div class="well sidebar-nav" id="nav_sidebar2">
          <ul class="nav nav-list">
            <li class="nav-header">
              Блокноты
            </li>
          </ul>
          <ul class="nav nav-list" id="notebook-list">
          </ul>
        </div><!--/.well -->
      </div><!--/span-->

      <div class="span8">
        <div class="row-fluid">
          <div class="well" id="tools">
            <button class="btn" id="clear-notebook">
              Очистить блокнот
            </button>
            <button class="btn" id="delete-notebook" href="#">
              Удалить блокнот
            </button>
            <button class="btn" id="delete-user" href="#">
              Удалить пользователя
            </button>
            <strong id="current-ntbusr-name" class="pull-right">...</strong>
          </div>
          <div class="" id="notes">        
          </div>
        </div>
      </div><!--/span-->
    </div><!--/row-->
  </div><!--/.fluid-container-->
  <div class="modal" id="notebook-settings" style="display:none;"></div>

  <script src="/static/lib/jquery.js"></script>
  <script src="/static/lib/bootstrap.js"></script>
  <script src="/static/lib/underscore.js"></script>
  <script src="/static/lib/backbone.js"></script>
  <script src="/static/lib/backbone-relational.js"></script>
  
  <script src="/static/js/notebookapp_admin.js"></script>
  <script type="text/javascript">
    NoteApp.bootstrap();
  </script>
</body>
</html>