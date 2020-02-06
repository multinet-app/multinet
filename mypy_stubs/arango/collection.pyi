from arango.cursor import Cursor  # type: ignore
from arango.exceptions import ArangoError  # type: ignore
from typing import Any, Optional, Dict, Union, List

class Collection:
    def count(self) -> int: ...
    def has(
        self, document: Any, rev: Optional[Any] = ..., check_rev: bool = ...
    ) -> bool: ...
    def keys(self) -> Cursor: ...
    def all(self, skip: Optional[Any] = ..., limit: Optional[Any] = ...) -> Cursor: ...
    def random(self) -> Dict: ...

class StandardCollection(Collection):
    def insert(
        self,
        document: Any,
        return_new: bool = ...,
        sync: Optional[Any] = ...,
        silent: bool = ...,
        overwrite: bool = ...,
        return_old: bool = ...,
    ) -> Union[bool, Dict]: ...
    def insert_many(
        self,
        documents: Any,
        return_new: bool = ...,
        sync: Optional[Any] = ...,
        silent: bool = ...,
        overwrite: bool = ...,
        return_old: bool = ...,
    ) -> List[Union[Dict, ArangoError]]: ...

class VertexCollection(Collection): ...
class EdgeCollection(Collection): ...
