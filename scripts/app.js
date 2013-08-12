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
			//this.model.set({name:e.currentTarget.value})
			this.model.set({name:this.inputTitle.val()})
		},

		changeAuthor: function(e){
			//this.model.set({author:e.currentTarget.value})
			this.model.set({author:this.inputAuthor.val()})
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

			this.listenTo(CreateBooks, 'add', this.addOne)
			this.listenTo(CreateBooks, 'reset', this.addAll)
			this.listenTo(CreateBooks, 'remove', this.removeModel)
			this.listenTo(CreateBooks, 'all', this.render)

			//CreateBooks.fetch(); // nothin to fetch...
			this.countEl =  this.$('.count');
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


				CreateBooks.reset();
			}
		},

		newBook: function () {
			CreateBooks.push(new Book());
			this.updateCount();
		},

		addOne: function (amodel) {
			var bookItem = new CreateBookItemView({model: amodel})
			this.$('#books_list').append(bookItem.render().el)
			this.updateCount();
		},

		addAll: function () {
			CreateBooks.each(this.addOne, this);
			this.updateCount();
			this.render();
		},
		removeModel: function () {
			this.updateCount();
			this.render
		},

		updateCount: function(){
			this.countEl.html(CreateBooks.length)
		}
	});


	var BookListItemView = Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#book-list-item-template').html()),

		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
		},

		events: {
			"click .delete": "clear"
		},

		clear: function () {
			this.model.destroy();
		},

		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}

	});

	var BookListView = Backbone.View.extend({
		el: $('#book_list'),

		initialize: function () {

			this.listenTo(BookCollection, 'add', this.addOne)
			this.listenTo(BookCollection, 'reset', this.addAll)
			this.listenTo(BookCollection, 'remove', this.renderModel)
			this.listenTo(BookCollection, 'all', this.render)

			BookCollection.fetch();
			this.countEl =  this.$('.count');
			this.bookItems = this.$('#book_items');
		},

		addOne: function (amodel) {

			var bookItem = new BookListItemView({model: amodel})
			this.bookItems.append(bookItem.render().el)
			this.updateCount();
		},

		addAll: function () {
			BookCollection.each(this.addOne, this);
			this.updateCount();
		},

		renderModel: function () {
			this.updateCount();
			this.render();
		},

		updateCount: function(){
			this.countEl.html(BookCollection.length)
		}


	});


	var CreateForm = new CreateBooksCollectionView();
	var BookList = new BookListView();
});

