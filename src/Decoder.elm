module Decoder exposing (..)

import Json.Decode exposing (..)
import Json.Decode.Pipeline exposing (..)
import Types exposing (..)


releaseStatusDecoder : Decoder ReleaseStatus
releaseStatusDecoder =
    decode ReleaseStatus
        |> required "archive" statusDecoder
        |> required "release-notes" statusDecoder
        |> required "security-advisories" statusDecoder
        |> required "download-links" statusDecoder
        |> required "product-details" statusDecoder


statusDecoder : Decoder Status
statusDecoder =
    string
        |> andThen
            (\value ->
                case value of
                    "missing" ->
                        succeed Missing

                    "incomplete" ->
                        succeed Incomplete

                    "exists" ->
                        succeed Exists

                    "error" ->
                        succeed <| Error "An error occured"

                    somethingElse ->
                        fail <| "Unknown status: " ++ somethingElse
            )
