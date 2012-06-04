NoteApp = {};

/// Models
NoteApp.Note = Backbone.RelationalModel.extend({
    urlRoot:'/api/note',
});


NoteApp.Notebook = Backbone.RelationalModel.extend({
    urlRoot:'/api/notebook',
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

NoteApp.NotebookCollection = Backbone.Collection.extend({
    url: '/api/notebook',
    model: NoteApp.Notebook,
});

///Views

NoteApp.NotebookListItemView = Backbone.View.extend({

    tagName:"li",
    className:"notebook",

    initialize:function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        $(this.el).attr('id',"notebook-"+this.model.get('id'));
        return this;
    },

    events:{
        'click':'on_click',
    },

    on_click:function(e){
        NoteApp.app.navigate('/notebook/'+this.model.get('id'), {trigger:true});
        return false;
    },
});

NoteApp.NotebookListView = Backbone.View.extend({

    initialize:function () {
        var self = this;
        this.model.bind("reset", this.render, this);
        this.model.bind("change", this.render, this);
        this.model.bind("add", function (notebook) {
            $(self.el).append(new NoteApp.NotebookListItemView({model:notebook}).render().el);
        });        
    },

    render:function () {
        $(this.el).empty();
        _.each(this.model.models, function (notebook) {
            $(this.el).append(new NoteApp.NotebookListItemView({model:notebook}).render().el);
        }, this);
        return this;
    },

    events:{
        "click #btn-create-ntb":"create_notebook",
    },

    create_notebook:function(){
        var notebook_name_input = $(this.el).find(".new-notebook #notebook-name");
        if(notebook_name_input.size()==0)
            return false;
        var notebook_name = notebook_name_input.val().trim();
        if(notebook_name.length > 0)
        {
            this.model.create({name:notebook_name},{wait:true});
        }
        $(this.el).find(".new-notebook").remove();
        return false;
    },

});

NoteApp.NoteListItemView = Backbone.View.extend({

    tagName:"div",
    className:"well note",

    initialize:function () {                
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function () {
        $(this.el).attr("id" ,"note-"+this.model.id);
        $(this.el).html(this.template(this.model.toJSON()));
        if(NoteApp.current_notebook && NoteApp.current_notebook.id == this.model.id){
            $(this.el).addClass('active');
        }
        return this;
    },

    events:{
        "click .edit-note":"click_edit",
        "click .save-note":"click_save",
        "click .delete-note":"click_delete",
        "click .cancel-edit":"click_cancel",
    },

    click_edit:function(){
        $(this.el).addClass("editing");
        //$(this.el).find(".new-note .edit-text").autosize();
    },

    click_save:function(){
        var new_title = $(this.el).find(".edit-group .edit-title").val();
        var new_text  = $(this.el).find(".edit-group .edit-text").val();
        this.model.save({title:new_title, text:new_text});
        $(this.el).removeClass("editing");
    },

    click_delete:function(){
        this.model.destroy({wait:true});
        $(this.el).remove();
        NoteApp.notebooks_list.fetch();
    },

    click_cancel:function(){
        $(this.el).find(".edit-group .edit-title").val(
            $(this.el).find(".view-group .message-title").text()
        );
        $(this.el).find(".edit-group .edit-text").val(
            $(this.el).find(".view-group .message-text").text()
        );        
        $(this.el).removeClass("editing");
    }
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
                $(self.el).append(new NoteApp.NoteListItemView({model:note}).render().el);
            }
        });        
    },

    render:function () {
        $("#current-notebook-name").text(this.model.get('name'));
        $(this.el).empty();    
        if(this.model.get('notes').models.length == 0){
            var msg = "В блокноте нет записей";
            $(this.el).append('<div class="alert alert-info">'+msg+'</div>')
        }else{
            _.each(this.model.get('notes').models, function (note) {
                $(this.el).append(new NoteApp.NoteListItemView({model:note}).render().el);
            }, this);        
        }
        return this;
    },


    events:{
        "click #create-note":"click_create",
        "click #cancel-new-note":"click_cancel",
    },

    click_create:function(){
        var new_title = $(this.el).find(".new-title").val().trim();
        var new_text  = $(this.el).find(".new-text").val().trim();
        if( new_title.length!=0 || new_text.length!=0 ){
            NoteApp.current_notebook.get('notes').create({  
                title:new_title, 
                text:new_text, 
                notebook_id:NoteApp.current_notebook,
            },{wait: true});
            NoteApp.notebooks_list.fetch();
        }
        $(this.el).find(".new-note").parent().remove();
    },

    click_cancel:function(){
        $(this.el).find(".new-note").parent().remove();
    },

});

NoteApp.NewNoteFormView = Backbone.View.extend({

    tagName:"div",

    initialize:function () {
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    }
});

NoteApp.NotebookSettingsView = Backbone.View.extend({

    initialize:function () {
    },

    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events:{
        "click #delete-notebook":"delete_notebook",
        "click #update-notebook":"update_notebook",
    },

    delete_notebook:function(){
        NoteApp.current_notebook.destroy({wait:true});
        NoteApp.app.navigate("/",{trigger:true});
        $(this.el).modal('hide');
    },

    update_notebook:function(){
        var new_name = $(this.el).find('#edit-notebook-name').val().trim();
        if(new_name.length != 0){
            NoteApp.current_notebook.save({name:new_name}, {wait:true});
        }
        $(this.el).find('#edit-notebook-name').val(NoteApp.current_notebook.get('name'));
    },
});

/// Router
NoteApp.Router = Backbone.Router.extend({
    routes:{
        "notebook/:id":"show_notebook",
        "notebook/:id/":"show_notebook",
        "": "home",
    },

    initialize:function(){
        var user = new Backbone.Model();
        user.url = '/api/user';
        user.fetch({success:function(data){
            $("#user_name").text(data.get('name'));
        }});
    },

    home:function(){
        NoteApp.notebooks_list = new NoteApp.NotebookCollection();
        var notebook_list_view = new NoteApp.NotebookListView({
            el:$("#notebook-list"), model:NoteApp.notebooks_list
        });  
        var self = this;
        NoteApp.notebooks_list.fetch({success:function(data){
            if(self.requestId){
                self.show_notebook(self.requestId);
            }
            else{
                NoteApp.app.navigate('/notebook/'+ 
                    data.find(function(n){ return n.get('deflt'); }).get('id'),{trigger:true});
                //self.show_notebook(data.find(function(n){ return n.get('deflt'); }).get('id'));
            }
        }}); 
    },

    set_active_notebook:function(id){
        $("#notebook-list").find(".active").removeClass("active");
        $("#notebook-list").find("#notebook-"+id).addClass("active");
    },

    show_notebook:function(id){
        if(NoteApp.notebooks_list)
        {
            NoteApp.current_notebook = NoteApp.notebooks_list.get(id);
            if(!NoteApp.current_notebook){
                this.requestId = null;
                this.home();
                return;
            }
            var notes_list_view = new NoteApp.NoteListView({
                el:$("#notes"), model:NoteApp.current_notebook
            });            
            NoteApp.current_notebook.fetch();
            this.set_active_notebook(id);
        }
        else
        {
            this.requestId = id;
            this.home();
        }
    },
});
/// App
NoteApp.app = null;

NoteApp.bootstrap = function(){
    //template preload
    var views = ["NotebookListItemView", "NoteListItemView", "NewNoteFormView", "NotebookSettingsView"];
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

    $("#create-new-note").click(function(){
        if($("#notes .new-note").size() == 0){
            $("#notes").append(new NoteApp.NewNoteFormView().render().el)
            $("#notes .new-note .new-title").focus();    
        }
        else
        {
           $("#notes .new-note .new-title").focus();
        }
        return false;
    });

    $("#create-notebook").click(function(){
        if($("#create-notebook.btn").length == 0)
        {
            $("#create-notebook").addClass("btn");
            $("#new-notebook-name").show();
            $("#new-notebook-name").focus();
        }
        else
        {
            var new_name = $("#new-notebook-name").val().trim();
            if(new_name.length > 0){
                NoteApp.notebooks_list.create({name:new_name},{wait:true});
            }
            $("#create-notebook").removeClass("btn");
            $("#new-notebook-name").val("");
            $("#new-notebook-name").hide();
        }
        return false;
    });

    $("#show-notebook-settings").click(function(){
        var ntb_sth = new NoteApp.NotebookSettingsView({
            el:$("#notebook-settings"), model: NoteApp.current_notebook });
        ntb_sth.render();
        $("#notebook-settings").modal('show');
    });
};
