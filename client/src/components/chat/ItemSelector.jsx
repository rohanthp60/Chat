import styles from "./Chat.module.css";
import { useState } from "react";

const ItemSelector = ({ items, selectedItems, setSelectedItems, ItemComponent, checkDisabled = false, singleSelect = false }) => {
    const [searchText, setSearchText] = useState("");
    const normalizedSearchText = searchText.trim().toLowerCase();
    const filteredItems = items.filter(item => {
        const searchableText = [
            item.userId,
            item.firstName,
            item.middleName,
            item.lastName
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(normalizedSearchText);
    });

    return (
    <>
    <div className={styles.searchField}>
        <label htmlFor="contact-search">Search contacts</label>
        <input
            id="contact-search"
            className={styles.searchInput}
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by user ID or name"
        />
    </div>
    <ul className={styles.selector}>
        {filteredItems.map(item => {
            const isSelected = selectedItems.includes(item.id);

            return (
            <li className={styles.selectorItem} key={item.id}>
                <label>
                    <input
                        className={styles.checkboxInput}
                        type="checkbox"
                        value={item.id}
                        checked={isSelected}
                        onChange={event => {
                            setSelectedItems(previous => {
                                if (event.target.checked) {
                                    return singleSelect
                                        ? [item.id]
                                        : [...previous, item.id];
                                }

                                return previous.filter(id => id !== item.id);
                            });
                        }}
                        disabled={checkDisabled}
                    />
                    <span className={styles.checkbox} aria-hidden="true">
                        <span className={styles.checkboxMark}>✓</span>
                    </span>
                    <ItemComponent item={item} />
                </label>
            </li>
        )})}
    </ul>
    </>
)};

export default ItemSelector;
