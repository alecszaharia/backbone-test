/**
 * Created by Alecszaharia on 8/12/13.
 */

var app = app || {};

var ENTER_KEY = 13;

/**
 * Book model
 * Attributes:
 * - Item title
 * - Item
 * @type {void|_.extend|*|Backbone.Model.extend|*|Backbone.Collection.extend|*|Backbone.Router.extend|*|Backbone.View.extend|*|Backbone.History.extend|*|jQuery.extend|*|jQuery.extend|*}
 */

app.Book = Backbone.Model.extend({
	defaults: function () {
		return { author: '', title: '', marked: false, selected: false,visible:true };
	},

	validate: function (attrs, options) {
		if ( attrs.title == '' ) {
			return 'Title cannot be null';
		}
		if ( attrs.author == '' ) {
			return 'Author cannot be null';
		}
	}



});


/**
 *  Create book collection
 * @type {void|_.extend|*|Backbone.Model.extend|*|Backbone.Collection.extend|*|Backbone.Router.extend|*|Backbone.View.extend|*|Backbone.History.extend|*|jQuery.extend|*|jQuery.extend|*}
 */
app.CreateBooksCollection = Backbone.Collection.extend({
	model: app.Book,
	url: '/'
})

/**
 * Book list collection
 * @type {void|_.extend|*|Backbone.Model.extend|*|Backbone.Collection.extend|*|Backbone.Router.extend|*|Backbone.View.extend|*|Backbone.History.extend|*|jQuery.extend|*|jQuery.extend|*}
 */
app.BookListCollection = Backbone.Collection.extend({
	model: app.Book,
	url: '/',

	filter_by_keyword: function(keyword) {

		if(keyword.trim()=='') return;

		var filter = new RegExp(keyword);

		this.each(function(book){

			 if( filter.exec( book.get('title') ) || filter.exec( book.get('author') ))
			 {
				 book.set('visible',true);
			 }
			 else
			 {
				 book.set('visible',false);
			 }
		})
	}
});


/**
 * View for a book in the 'Create book form'
 * @type {void|_.extend|*|Backbone.Model.extend|*|Backbone.Collection.extend|*|Backbone.Router.extend|*|Backbone.View.extend|*|Backbone.History.extend|*|jQuery.extend|*|jQuery.extend|*}
 */
app.CreateBookItemView = Backbone.View.extend({
	tagName: 'li',

	template: _.template($('#book-create-template').html()),

	events: {
		"click .delete": "clear",
		"change .book_title": 'changeTitle',
		"change .book_author": 'changeAuthor'
	},

	initialize: function () {
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.remove);

		this.inputTitle = this.$('.book_title')
		this.inputAuthor = this.$('.book_author')

	},

	clear: function () {
		this.model.destroy();
	},

	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	changeTitle: function (e) {
		// add silent:true to not loose the focus.. the change event will not be triggered as there is no need to render the for again.
		this.model.set({title: e.currentTarget.value}, {silent: true});
	},

	changeAuthor: function (e) {
		// add silent:true to not loose the focus.. the change event will not be triggered as there is no need to render the for again.
		this.model.set({author: e.currentTarget.value}, {silent: true})
	}

});

app.CreateBooksCollectionView = Backbone.View.extend({
	el: $('#create_books'),

	//formTemplate: _.template($('#books-create-form-template').html()),

	events: {
		"click .save-books": 'createBooks',
		"click .add-book": 'newBook'

	},

	initialize: function () {

		//CreateBooks.fetch(); // nothin to fetch...
		this.countEl = this.$('.count');

		this.listenTo(this.collection, 'add', this.addBook)
		this.listenTo(this.collection, 'reset', this.resetBooks)
		this.listenTo(this.collection, 'remove', this.render)
		this.listenTo(this.collection, 'all', this.render)


	},

	createBooks: function () {
		if ( this.collection.length == 0 ) {
			alert('Please add a book.');
		}
		else {
			// we need to clone the models before add the to the BookCollection
			_.each(this.collection.models, function (model) {
				app.BookList.collection.add(new app.Book(model.toJSON()));
			}, this);

			// destroy all books from the create list
			while (this.collection.length != 0) {
				var t = this.collection.pop()
				t.destroy();
			}


		}
	},

	newBook: function () {

		if ( this.collection.length == 0 || (this.collection.last().isValid()) ) {
			this.collection.push(new app.Book());
		}

	},

	addBook: function (amodel) {
		var bookItem = new app.CreateBookItemView({model: amodel})
		this.$('.books_list').append(bookItem.render().el)
	},

	resetBooks: function () {
		this.collection.each(this.addBook, this);
	},

	updateCount: function () {
		this.countEl.html(this.collection.length)
	},

	render: function () {

		this.updateCount();
		return this
	}

});


app.BookListItemView = Backbone.View.extend({

	tagName: 'li',

	template: _.template($('#book-list-item-template').html()),

	initialize: function () {

		//this.selected = this.$('.selected')

		this.listenTo(this.model, 'change:visible', this.visible);
		this.listenTo(this.model, 'change', this.modelChanged);
		this.listenTo(this.model, 'destroy', this.remove);
	},

	events: {   "click .delete": "clear",
		"click .mark": "mark",
		"click .unmark": "unmark",
		"click .selected": 'toggleSelected'
	},

	clear: function () {
		this.model.destroy();
	},

	mark: function () {
		this.model.set({marked: true})
	},

	unmark: function () {
		this.model.set({marked: false})
	},

	modelChanged: function () {
		this.render();
	},

	toggleSelected: function (e) {
		this.model.set({selected: e.currentTarget.checked}, {silent: true})
	},

	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	visible: function(){
		if(this.model.get('visible'))
			this.$el.show();
		else
			this.$el.hide();
	}
});

app.BookListView = Backbone.View.extend({
	el: $('#book_list'),

	events: {
				"click .delete-selected": "deleteSelected",
				"click input[name=filter_button]": "filterBooks"
			},

	initialize: function () {

		this.countEl = this.$('.count');
		this.bookItems = this.$('.book_items');
		this.filter = this.$('input[name=filter]');

		this.listenTo(this.collection, 'add', this.addBook);
		this.listenTo(this.collection, 'reset', this.addAll);
		this.listenTo(this.collection, 'remove', this.render);
		//this.listenTo(this.collection, 'filter', this.filterAll);
		this.listenTo(this.collection, 'all', this.render);


		this.collection.fetch();
	},


	/* model events */
	addBook: function (amodel) {
		var bookItem = new app.BookListItemView({model: amodel})
		this.bookItems.append(bookItem.render().el)
	},

	addAll: function () {
		this.$('.book_items').html('')
		this.collection.each(this.addBook, this);
	},

	updateCount: function () {
		this.countEl.html(this.collection.length)
	},

	/* view events */
	deleteSelected: function () {
		var selected = this.collection.where({selected: true});
		var m = null;
		while (m = selected.pop()) m.destroy();

	},

	filterBooks: function() {
		this.collection.filter_by_keyword(this.filter.val());
	},

	/*
	filterOne: function(book)
	{
		console.log('call filterOne');
		book.trigger('visible')
	},

	filterAll: function()
	{
		console.log('filter');
		this.collection.each(this.filterOne,this)
	},*/


	render: function () {
		this.updateCount();
		return this
	}
});


app.AppView = Backbone.View.extend({
	el: $('body'),

	initialize: function () {
		app.CreateForm = new app.CreateBooksCollectionView({collection: new app.CreateBooksCollection()});
		app.BookList   = new app.BookListView({collection: new app.BookListCollection()});
	}

});


$(document).ready(function () {

	var application = new app.AppView();

});


