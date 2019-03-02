class CreateThemes < ActiveRecord::Migration[5.2]
  def change
    create_table :themes do |t|
      t.string :title
      t.integer :group_id
      t.integer :posts_count
      t.integer :topics_count
      t.json :last_post

      t.timestamps
    end
  end
end
