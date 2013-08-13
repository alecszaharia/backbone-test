/**
 * Created by Alecszaharia on 8/12/13.
 */
$(document).ready(function () {
	/**
	 * Book model
	 * Attributes:
	 * - Item title
	 * - Item
	 * @type {void|_.extend|*|Backbone.Model.extend|*|Backbone.Collection.extend|*|Backbone.Router.extend|*|Backbone.View.extend|*|Backbone.History.extend|*|jQuery.extend|*|jQuery.extend|*}
	 */
	var Book = Backbone.Model.extend({
		defaults: function () {
			return { author: '', title: '', read: false };
		},
		validate: function(attrs,options){
			if(attrs.title=='')
				return 'Title cannot be null';
			if(attrs.author=='')
				return 'Author cannot be null';
		}

	});


	/**
	 *  Create book collection
	 * @type {void|_.extend|*|Backbone.Model.extend|*|Backbone.Collection.extend|*|Backbone.Router.extend|*|Backbone.View.extend|*|Backbone.History.extend|*|jQuery.extend|*|jQuery.extend|*}
	 */
	var CreateBooksCollection = Backbone.Collection.extend({
		model: Book,
		url: '/'
	})

	/**
	 * Book list collection
	 * @type {void|_.extend|*|Backbone.Model.extend|*|Backbone.Collection.extend|*|Backbone.Router.extend|*|Backbone.View.extend|*|Backbone.History.extend|*|jQuery.extend|*|jQuery.extend|*}
	 */
	var BookListCollection = Backbone.Collection.extend({
		model: Book,
		url: '/'
	});

	var CreateBooks = new CreateBooksCollection();
	var BookCollection = new BookListCollection();


	/**
	 * View for a book in the 'Create book form'
	 * @type {void|_.extend|*|Backbone.Model.extend|*|Backbone.Collection.extend|*|Backbone.Router.extend|*|Backbone.View.extend|*|Backbone.History.extend|*|jQuery.extend|*|jQuery.extend|*}
	 */
	var CreateBookItemView = Backbone.View.extend({
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

		changeTitle: function(e){
			// add silent:true to not loose the focus.. the change event will not be triggered as there is no need to render the for again.
			this.model.set({title:e.currentTarget.value},{silent:true});
		},

		changeAuthor: function(e){
			// add silent:true to not loose the focus.. the change event will not be triggered as there is no need to render the for again.
			this.model.set({author:e.currentTarget.value},{silent:true})
		}

	});

	var CreateBooksCollectionView = Backbone.View.extend({
		el: $('#create_books'),

		//formTemplate: _.template($('#books-create-form-template').html()),

		events: {
			"click .save-books": 'createBooks',
			"click .add-book": 'newBook'

		},

		initialize: function () {

			//CreateBooks.fetch(); // nothin to fetch...
			this.countEl =  this.$('.count');

			this.listenTo(CreateBooks, 'add', this.addBook)
			this.listenTo(CreateBooks, 'reset', this.resetBooks)
			this.listenTo(CreateBooks, 'remove', this.render)
			this.listenTo(CreateBooks, 'all', this.render)


		},

		createBooks: function () {
			if ( CreateBooks.length == 0 )
				alert('Please add a book.');
			else
			{
				// we need to clone the models before add the to the BookCollection
				_.each(CreateBooks.models,function(model){
					BookCollection.add(new Book(model.toJSON()));
				},this);

				// destroy all books from the create list
				while(CreateBooks.length!=0)
				{
					var t = CreateBooks.pop()
					t.destroy();
				}
			}
		},

		newBook: function () {

			if(CreateBooks.length == 0 || (CreateBooks.last().isValid()))
			{
				CreateBooks.push(new Book());
			}

		},

		addBook: function (amodel) {
			var bookItem = new CreateBookItemView({model: amodel})
			this.$('.books_list').append(bookItem.render().el)
		},

		resetBooks: function () {
			CreateBooks.each(this.addBook, this);
		},

		updateCount: function(){
			this.countEl.html(CreateBooks.length)
		},

		render: function(){

			this.updateCount();
			return this
		}

	});


	var BookListItemView = Backbone.View.extend({

		tagName: 'li',

		template: _.template( $('#book-list-item-template').html() ),

		initialize: function () {
			this.listenTo(this.model, 'change', this.modelChanged);
			this.listenTo(this.model, 'destroy', this.remove);
		},

		events: {  "click .delete": "clear" },

		clear: function () {
			this.model.destroy();
		},

		modelChanged: function(){
			this.render();
		},

		render: function () {

			console.log(this.template(this.model.toJSON()));
			this.$el.html( this.template(this.model.toJSON()) );
			return this;
		}

	});

	var BookListView = Backbone.View.extend({
		el: $('#book_list'),

		initialize: function () {

			this.countEl =  this.$('.count');
			this.bookItems = this.$('.book_items');

			this.listenTo(BookCollection, 'add', this.addBook)
			this.listenTo(BookCollection, 'reset', this.addAll)
			this.listenTo(BookCollection, 'remove', this.render)
			this.listenTo(BookCollection, 'all', this.render)

			BookCollection.fetch();

		},

		addBook: function (amodel) {

			var bookItem = new BookListItemView({model: amodel})
			this.bookItems.append(bookItem.render().el)
		},

		addAll: function () {
			BookCollection.each(this.addOne, this);
		},

		updateCount: function(){
			this.countEl.html(BookCollection.length)
		},

		render: function(){

			this.updateCount();
			return this
		}


	});


	var CreateForm = new CreateBooksCollectionView();
	var BookList = new BookListView();
});

