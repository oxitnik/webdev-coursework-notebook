NoteApp = {};

/// Models
NoteApp.Note = Backbone.RelationalModel.extend({
    urlRoot:'/api/admin/note',
});


NoteApp.Notebook = Backbone.RelationalModel.extend({
    urlRoot:'/api/admin/notebook',
    relations: [{
        type: Backbone.HasMany,
        key: 'notes',
        relatedModel: 'NoteApp.Note',
        reverseRelation: {
            key: 'notebook_id',
            includeInJSON: 'id',
        },
    }],
});

NoteApp.User = Backbone.RelationalModel.extend({
    urlRoot:'/api/admin/user',
    relations: [{
        type: Backbone.HasMany,
        key: 'notebooks',
        relatedModel: 'NoteApp.Notebook',
        reverseRelation: {
            key: 'user_id',
            includeInJSON: 'id',
        },
    }],
});

NoteApp.UserCollection = Backbone.Collection.extend({
    url: '/api/admin/user',
    model: NoteApp.User,
});


////////Views///////////////

//UserListView
NoteApp.UserListItemView = Backbone.View.extend({

    tagName:"li",
    className:"user-item",

    initialize:function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        $(this.el).attr('id',"user-"+this.model.get('id'));
        if(NoteApp.current_user && NoteApp.current_user.id == this.model.id){
            $(this.el).addClass("active");
        }
        return this;
    },

    events:{
        'click':'on_click',
    },

    on_click:function(e){
        NoteApp.app.navigate('/user/'+this.model.get('id'), {trigger:true});
        return false;
    },
});

NoteApp.UserListView = Backbone.View.extend({

    initialize:function () {
        var self = this;
        this.model.bind("reset", this.render, this);
        this.model.bind("change", this.render, this);
        this.model.bind("add", function (user) {
            $(self.el).append(new NoteApp.UserListItemView({model:user}).render().el);
        });        
    },

    render:function () {
        $(this.el).empty();
        _.each(this.model.models, function (user) {
            $(this.el).append(new NoteApp.UserListItemView({model:user}).render().el);
        }, this);
        return this;
    },
});

// NotebookListView

NoteApp.AdminNotebookListItemView = Backbone.View.extend({

    tagName:"li",
    className:"notebook",

    initialize:function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        $(this.el).attr('id',"notebook-"+this.model.get('id'));
        if(NoteApp.current_notebook && NoteApp.current_notebook.id == this.model.id){
            $(this.el).addClass('active');
        }
        return this;
    },

    events:{
        'click':'on_click',
    },

    on_click:function(e){
        NoteApp.app.navigate('/user/'+this.model.get('user_id').id+'/'+this.model.get('id'), {trigger:true});
        return false;
    },
});

NoteApp.NotebookListView = Backbone.View.extend({

    initialize:function () {
        var self = this;
        this.model.bind("reset", this.render, this);
        this.model.bind("change", this.render, this);
        this.model.bind("add", function (notebook) {
            //$(self.el).append(new NoteApp.NotebookListItemView({model:notebook}).render().el);
            self.render();
        });        
    },

    render:function () {
        $(this.el).empty();
        _.each(this.model.models, function (notebook) {
            $(this.el).append(new NoteApp.AdminNotebookListItemView({model:notebook}).render().el);
        }, this);
        return this;
    },

});


// NoteListView
NoteApp.AdminNoteListItemView = Backbone.View.extend({

    tagName:"div",
    className:"well note",

    initialize:function () {                
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function () {
        $(this.el).attr("id" ,"note-"+this.model.id);
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events:{
        "click .delete-note":"click_delete",
    },

    click_delete:function(){
        this.model.destroy({wait:true});
        $(this.el).remove();
        NoteApp.users_list.fetch();
    },
});

NoteApp.NoteListView = Backbone.View.extend({

    initialize:function () {
        var self = this;        
        this.model.bind("reset", this.render, this);
        this.model.bind("change", this.render, this);
       // this.model.bind("add:notes", this.render, this);
        this.model.bind("add:notes", function (note) {
            $(self.el).find(".alert-info").hide();
            if($(self.el).find("#note-"+note.id).length == 0){
                $(self.el).append(new NoteApp.AdminNoteListItemView({model:note}).render().el);
            }
        });        
    },

    render:function () {
        $("#current-ntbusr-name").text(this.model.get('user_id').get('name')+"/"+this.model.get('name'));
        $(this.el).empty();    
        if(this.model.get('notes').models.length == 0){
            var msg = "В блокноте нет записей";
            $(this.el).append('<div class="alert alert-info">'+msg+'</div>')
        }else{
            _.each(this.model.get('notes').models, function (note) {
                $(this.el).append(new NoteApp.AdminNoteListItemView({model:note}).render().el);
            }, this);        
        }
        return this;
    },
});


/// Router
NoteApp.Router = Backbone.Router.extend({
    routes:{
        "user/:user_id":"show_user",
        "user/:user_id/:notebook_id":"show_user_notebook",
        "": "home",
    },

    initialize:function(){
        var user = new Backbone.Model();
        user.url = '/api/user';
        user.fetch({success:function(data){
            $("#user_name").text(data.get('name'));
        }});
    },

    show_user:function(user_id){
        console.log("show_user");
        if(!NoteApp.users_list){
            NoteApp.req_user_id = user_id;
            this.home();
        }
        else
        {       
            NoteApp.current_user = NoteApp.users_list.get(user_id);
            var notebooks_list_view = new NoteApp.NotebookListView({
              el:$("#notebook-list"), model:NoteApp.current_user.get('notebooks')
            });  
            NoteApp.current_user.fetch();
            if(NoteApp.req_ntb_id){
                this.show_user_notebook(NoteApp.req_user_id, NoteApp.req_ntb_id);
            }
        }
    },

    show_user_notebook:function(user_id, notebook_id){
        console.log("show_user_notebook");
        if(!NoteApp.current_user){          
            NoteApp.req_user_id = user_id;
            NoteApp.req_ntb_id  = notebook_id;
            this.home();
        }
        else{
            NoteApp.current_notebook = NoteApp.current_user.get('notebooks').get(notebook_id);
            var notes_list_view = new NoteApp.NoteListView({
                el:$("#notes"), model:NoteApp.current_notebook
            });            
            NoteApp.current_notebook.fetch();
            NoteApp.req_user_id = null;
            NoteApp.req_ntb_id  = null;
        }
        
    },

    home:function(){
        console.log("home");
        NoteApp.users_list = new NoteApp.UserCollection();
        var user_list_view = new NoteApp.UserListView({
            el:$("#user-list"), model:NoteApp.users_list
        });  
        NoteApp.users_list.fetch();
        if(NoteApp.req_user_id){
            this.show_user(NoteApp.req_user_id);
        }
    },
});
/// App
NoteApp.app = null;

NoteApp.bootstrap = function(){
    //template preload
    var views = ["AdminNotebookListItemView", "AdminNoteListItemView", "UserListItemView"];
    var deferreds = [];
    $.each(views, function(index, view) {
        if (NoteApp[view]) {
            deferreds.push($.get('/static/tpl/' + view + '.html', function(data) {
                NoteApp[view].prototype.template = _.template(data);
            }, 'html'));
        } else {
            alert(view + " not found");
        }
    });

    $.when.apply(null, deferreds).done(function(){
        NoteApp.app = new NoteApp.Router();
        Backbone.history.start();
    });

    $("#delete-notebook").click(function(){
        NoteApp.current_notebook.destroy({wait:true});
        NoteApp.app.navigate('/user/'+NoteApp.current_user.id+'/'
            + NoteApp.current_user.get('notebooks').first().id, {trigger:true});
    });

    $("#clear-notebook").click(function(){
        NoteApp.current_notebook.get('notes').each(function(note){
            note.destroy({wait:true});
        });
        NoteApp.app.navigate(
            '/user/'+NoteApp.current_notebook.get('user_id').id+'/'+NoteApp.current_notebook.id,
            {trigger:true});
    });

    $("#delete-user").click(function(){
        NoteApp.current_user.destroy({wait:true});
        NoteApp.app.navigate('/user/'+NoteApp.users_list.first().id, {trigger:true});
    });    

};
